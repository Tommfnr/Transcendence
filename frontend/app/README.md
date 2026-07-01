# Transcendence — Frontend

Application Angular (v22) — plateforme de prêt d'objets entre particuliers.

## Lancer en dev
cd frontend/app
npm install

## Lancer via Docker
make

## Structure
src/app/
├── pages/       → vues/routes
├── components/  → composants réutilisables
├── services/    → appels HTTP (NestJS API)
├── guards/      → protection des routes
└── models/      → interfaces TypeScript