# Sélecteur de date « Aller à une date »

Guide d'implémentation d'un champ calendrier qui, une fois une date choisie, **fait défiler la page jusqu'à l'élément correspondant et le met en surbrillance** — ou signale que la date n'existe pas dans les données.

Vanilla JS, sans framework. Deux variantes couvertes : **avec [flatpickr](https://flatpickr.js.org/)** (rapide) et **100 % maison** (zéro dépendance).

---

## 1. Ce que fait le composant

```
┌────────────────────────────┐
│ 📅  Aller à une date…    ✕ │   ← champ readonly, ouvre un calendrier au clic
└────────────────────────────┘
   Cette date n'est pas dans le planning.   ← message d'erreur conditionnel
```

Au choix d'une date :

```
date affichée "25/12/2026"
      │
      ├─ 1. normalisation  → "2026-12-25" (ISO)
      │
      ├─ 2. recherche dans les données DÉJÀ chargées
      │
      ├─ 3a. trouvée   → scroll horizontal/vertical vers la cible
      │                  + contour ambre pendant 2 s
      │
      └─ 3b. absente   → message d'erreur, aucun scroll
```

**Ce n'est pas un filtre** : rien n'est rechargé, rien n'est masqué. C'est un raccourci de navigation.

---

## 2. Les 3 décisions à prendre AVANT de coder

| Question | Options | Conséquence |
|---|---|---|
| **Navigation ou filtre ?** | Scroller vers l'élément **ou** recharger/filtrer les données | Si navigation : toute date hors du jeu de données chargé donnera « introuvable », même si elle existe côté serveur. C'est le piège n°1 (voir §9). |
| **Librairie ou maison ?** | flatpickr (~20 ko, locale FR incluse) **ou** ~70 lignes de JS | Maison = contrôle total du DOM et du style, pas de CDN, mais tu gères l'accessibilité clavier toi-même. |
| **Mobile ?** | Picker natif du téléphone **ou** même calendrier partout | Le natif est plus ergonomique mais **masque ton input d'origine** → ne jamais mesurer/cibler l'input, toujours son wrapper. |

---

## 3. Étape 1 — Le markup

```html
<!-- Le wrapper est la référence de positionnement ET la cible de tout ce qui
     doit mesurer le champ (tooltip, popup, tutoriel). Jamais l'input. -->
<div class="date-field" id="dateFieldWrap">
  <span class="date-field__icon" aria-hidden="true">📅</span>

  <!-- readonly = pas de saisie clavier, on passe forcément par le calendrier -->
  <input type="text"
         id="dateInput"
         class="date-field__input"
         placeholder="Aller à une date…"
         autocomplete="off"
         readonly>

  <button type="button"
          id="dateClearBtn"
          class="date-field__clear"
          aria-label="Effacer la date"
          hidden>✕</button>
</div>

<!-- Zone de message, TOUJOURS présente dans le DOM (on ne fait que la masquer),
     sinon le layout saute à chaque erreur -->
<p id="dateError" class="date-field__error" hidden></p>
```

**Pourquoi `readonly` ?** Ça évite tout le travail de parsing de saisie libre (`25/12/26`, `25-12-2026`, `2026/12/25`…) et le clavier virtuel qui s'ouvre sur mobile par-dessus le calendrier. Si tu veux autoriser la frappe, prévois un parser tolérant **et** une validation.

---

## 4. Étape 2 — Le CSS minimal

```css
.date-field {
  position: relative;          /* référence pour l'icône, le ✕ et le calendrier */
  display: inline-block;
  width: 100%;
  max-width: 260px;
}

.date-field__input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2rem;   /* place pour l'icône à gauche, le ✕ à droite */
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;             /* readonly → le curseur texte induirait en erreur */
}

.date-field__icon {
  position: absolute;
  left: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;        /* sinon l'icône avale le clic d'ouverture */
}

.date-field__clear {
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.75rem;
  height: 1.75rem;
  border: 0;
  background: none;
  cursor: pointer;
  color: #9ca3af;
}
.date-field__clear:hover { color: #4b5563; }

.date-field__error {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #f97316;
}

/* Surbrillance de la cible après navigation */
.is-date-target {
  outline: 3px solid #f59e0b;
  outline-offset: -2px;        /* reste À L'INTÉRIEUR de la cellule,
                                  sinon le contour est rogné par overflow:hidden */
}
```

---

## 5. Étape 3 — Initialiser le calendrier

### Option A — flatpickr

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/fr.js"></script>
```

```js
let datePicker = null;

datePicker = flatpickr('#dateInput', {
  locale: 'fr',
  dateFormat: 'd/m/Y',      // ce que voit l'utilisateur
  disableMobile: false,     // true = ton calendrier partout ; false = natif sur mobile
  onChange: (dates, dateStr) => handleDatePick(dateStr)
});
```

> **Variante `altInput`** : `{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'j F Y' }` — la valeur interne est déjà en ISO (plus de conversion à faire) et l'utilisateur voit « 25 décembre 2026 ». flatpickr crée alors un **second input** visible et masque le tien : `input._flatpickr.altInput` pour y accéder.

> **Réinstanciation** : si le champ vit dans une modale rouverte plusieurs fois, appelle `datePicker.destroy()` avant de recréer, sinon tu empiles les instances et les listeners.

### Option B — 100 % maison

```js
const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTHS = ['janvier','février','mars','avril','mai','juin',
                'juillet','août','septembre','octobre','novembre','décembre'];

const pad = n => String(n).padStart(2, '0');
const toIso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

let calYear, calMonth, calOpen = false, calEl = null;

function openCalendar() {
  if (calOpen) return closeCalendar();
  const today = new Date();
  calYear = today.getFullYear();
  calMonth = today.getMonth();
  calEl = document.createElement('div');
  calEl.className = 'calendar-popup';
  document.getElementById('dateFieldWrap').appendChild(calEl);
  renderCalendar();
  calOpen = true;
  // différé : sinon le clic qui vient d'ouvrir referme aussitôt
  setTimeout(() => document.addEventListener('click', onOutsideClick), 0);
}

function closeCalendar() {
  document.removeEventListener('click', onOutsideClick);
  if (calEl) calEl.remove();
  calEl = null;
  calOpen = false;
}

function onOutsideClick(e) {
  if (!document.getElementById('dateFieldWrap').contains(e.target)) closeCalendar();
}

function renderCalendar() {
  const first = new Date(calYear, calMonth, 1).getDay();   // 0 = dimanche
  const offset = (first + 6) % 7;                           // décale pour lundi = 0
  const days = new Date(calYear, calMonth + 1, 0).getDate();

  let cells = '';
  for (let i = 0; i < offset; i++) cells += '<span></span>';
  for (let d = 1; d <= days; d++) {
    cells += `<button type="button" data-iso="${toIso(calYear, calMonth, d)}">${d}</button>`;
  }

  calEl.innerHTML = `
    <div class="calendar-popup__head">
      <button type="button" data-nav="-1" aria-label="Mois précédent">‹</button>
      <strong>${MONTHS[calMonth]} ${calYear}</strong>
      <button type="button" data-nav="1" aria-label="Mois suivant">›</button>
    </div>
    <div class="calendar-popup__weekdays">${WEEKDAYS.map(w => `<span>${w}</span>`).join('')}</div>
    <div class="calendar-popup__grid">${cells}</div>`;

  calEl.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => {
    calMonth += Number(b.dataset.nav);
    if (calMonth < 0)  { calMonth = 11; calYear--; }
    if (calMonth > 11) { calMonth = 0;  calYear++; }
    renderCalendar();
  });

  calEl.querySelectorAll('[data-iso]').forEach(b => b.onclick = () => {
    const iso = b.dataset.iso;
    const [y, m, d] = iso.split('-');
    document.getElementById('dateInput').value = `${d}/${m}/${y}`;
    closeCalendar();
    handleDatePick(`${d}/${m}/${y}`);
  });
}

document.getElementById('dateInput').addEventListener('click', openCalendar);
```

CSS associé (grille 7 colonnes) :

```css
.calendar-popup {
  position: absolute; top: calc(100% + 4px); left: 0; z-index: 50;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 0.5rem;
  padding: 0.5rem; box-shadow: 0 8px 24px rgba(0,0,0,.12); width: 17rem;
}
.calendar-popup__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem; }
.calendar-popup__weekdays,
.calendar-popup__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; }
.calendar-popup__weekdays span { font-size: .7rem; color: #9ca3af; }
.calendar-popup__grid button { padding: .35rem 0; border: 0; background: none; border-radius: .25rem; cursor: pointer; }
.calendar-popup__grid button:hover { background: #eff6ff; }
```

---

## 6. Étape 4 — La logique de sélection

C'est le cœur du composant, identique quelle que soit l'option choisie.

```js
// Les données déjà chargées : [{ id: 12, date: '2026-12-25', … }, …]
let items = [];

function handleDatePick(dateStr) {
  const clearBtn = document.getElementById('dateClearBtn');
  const error = document.getElementById('dateError');

  if (!dateStr) {                       // date effacée
    clearBtn.hidden = true;
    error.hidden = true;
    return;
  }
  clearBtn.hidden = false;

  // "25/12/2026" → "2026-12-25" — padStart obligatoire : "5/1/2026" existe
  const [d, m, y] = dateStr.split('/');
  const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

  const item = items.find(it => it.date === iso);

  if (!item) {
    error.textContent = "Cette date n'est pas dans le planning.";
    error.hidden = false;
    return;
  }

  error.hidden = true;
  scrollToItem(item.id);
  highlightItem(item.id);
}
```

**Comparer des chaînes ISO, pas des objets `Date`.** `'2026-12-25' === '2026-12-25'` est exact, gratuit et sans fuseau horaire. Deux `Date` ne sont jamais égales avec `===`, et `getTime()` t'expose aux décalages UTC.

---

## 7. Étape 5 — Scroll vers la cible

```js
function scrollToItem(id) {
  const el = document.getElementById(`item-${id}`);
  if (!el) return;

  const container = document.getElementById('gridContainer');

  // Cas 1 — conteneur à défilement HORIZONTAL (tableau large, colonnes) :
  // scrollIntoView est peu fiable sur l'axe inline avec des en-têtes sticky.
  // On calcule à la main, en réservant la largeur de la colonne figée.
  const FROZEN_COL_WIDTH = 120;
  container.scrollTo({ left: el.offsetLeft - FROZEN_COL_WIDTH, behavior: 'smooth' });

  // Cas 2 — simple défilement VERTICAL de la page :
  // el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
```

⚠️ `el.offsetLeft` est relatif au **premier ancêtre positionné**. Si ton conteneur scrollable n'est pas `position: relative`, la valeur sera fausse. Vérifie-le, ou utilise `el.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft`.

---

## 8. Étape 6 — Surbrillance temporaire

```js
let highlightTimer = null;
let highlightedEl = null;

function highlightItem(id) {
  // toujours nettoyer la précédente : sinon deux recherches successives
  // laissent deux contours à l'écran
  if (highlightedEl) highlightedEl.classList.remove('is-date-target');
  clearTimeout(highlightTimer);

  const el = document.getElementById(`item-${id}`);
  if (!el) return;

  el.classList.add('is-date-target');
  highlightedEl = el;

  highlightTimer = setTimeout(() => {
    el.classList.remove('is-date-target');
    highlightedEl = null;
  }, 2000);
}
```

---

## 9. Étape 7 — Reset

```js
function clearDate() {
  if (datePicker) datePicker.clear();          // flatpickr
  else document.getElementById('dateInput').value = '';   // version maison

  document.getElementById('dateClearBtn').hidden = true;
  document.getElementById('dateError').hidden = true;
}

document.getElementById('dateClearBtn').addEventListener('click', clearDate);
```

---

## 10. Pièges connus

| # | Piège | Correctif |
|---|---|---|
| 1 | **« Date introuvable » alors que la donnée existe** — l'élément est hors de la fenêtre de données chargée (pagination, vue glissante, année courante seulement). | Soit charger tout, soit détecter le hors-fenêtre et **recharger avant de scroller**. À trancher dès le §2. |
| 2 | `new Date('2026-12-25')` est interprété en **UTC** → affiche le 24 dans les fuseaux négatifs. | Manipuler les chaînes ISO, ou forcer `new Date('2026-12-25T12:00:00')`. |
| 3 | Sur mobile, le picker natif **masque l'input** → tout ce qui le mesure retourne `(0,0)`. | Cibler le **wrapper**, jamais l'input. |
| 4 | Le clic qui ouvre le calendrier déclenche aussitôt le « clic extérieur » qui le referme. | Attacher le listener `document` dans un `setTimeout(…, 0)`, ou utiliser `e.stopPropagation()`. |
| 5 | `padStart` oublié → `"2026-1-5"` ne matche jamais `"2026-01-05"`. | Helper `pad()` systématique. |
| 6 | Contour de surbrillance rogné par un `overflow: hidden`. | `outline-offset: -2px` (dessine à l'intérieur). |
| 7 | Instance de picker empilée à chaque ouverture de modale. | `destroy()` avant de recréer. |
| 8 | Le message d'erreur créé/supprimé du DOM fait sauter le layout. | Élément permanent, on bascule seulement `hidden`. |

---

## 11. Variantes utiles

**Restreindre les dates sélectionnables** — n'autoriser que les dates qui existent réellement :

```js
// flatpickr
flatpickr('#dateInput', {
  enable: items.map(i => i.date),   // seules ces dates sont cliquables
  minDate: 'today'
});
```
Avantage : le cas « date introuvable » disparaît par construction. Pense à **recharger la liste** `enable` quand les données changent.

**En mode filtre plutôt que navigation** — au lieu de scroller, stocke la date et relance ton filtrage :

```js
selectedDate = iso;
applyFilters();     // masque/affiche les lignes, ou refait un fetch
```

**Bornes de période** — flatpickr : `{ mode: 'range' }`, `onChange` reçoit alors deux dates ; côté maison, garder un `rangeStart` et compléter au second clic.

---

## 12. Checklist d'implémentation

- [ ] Décider : navigation ou filtre (§2)
- [ ] Décider : librairie ou maison (§2)
- [ ] Décider : picker natif sur mobile ou non (§2)
- [ ] Wrapper `position: relative` + input `readonly` + icône `pointer-events: none` + bouton ✕ + zone d'erreur permanente
- [ ] Initialiser le picker en locale FR, format d'affichage choisi
- [ ] `onChange` → normalisation ISO avec `padStart`
- [ ] Recherche dans les données chargées
- [ ] Branche trouvée : scroll + surbrillance
- [ ] Branche absente : message d'erreur, aucun scroll
- [ ] Afficher le ✕ dès qu'une date est posée
- [ ] `clearDate()` : `clear()` + masquer ✕ + masquer erreur
- [ ] Scroll horizontal calculé à la main si conteneur à colonnes / en-têtes sticky
- [ ] Nettoyage de la surbrillance précédente + `clearTimeout`
- [ ] `destroy()` si le champ vit dans une modale
- [ ] Tester : date hors fenêtre de données, mobile, date en début de mois (`5/1/2026`), deux recherches d'affilée
