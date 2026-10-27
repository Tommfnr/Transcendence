*This project has been created as part of the 42 curriculum by rshin, abonifac, tfournie, tiaperei, lgirerd.*

## Description

**PEP** (*Prêt Entre Particuliers*, French for "lending between individuals") started as an idea from abonifac (Alex) that the whole team agreed to build.

The idea is simple: help social groups and communities of any size share what they need, whether that's a specific object or a service, and let them choose from the offers that other members of the same group make in good will.

Plenty of platforms already do something similar, such as Facebook Marketplace, Leboncoin or the more recent Poppins.

### What makes PEP different?

Most social networks and marketplaces today work the same way. They remove social friction and focus on the transaction, which is almost always paid. Everyone gets what they need in one click, with no social bond, no sense of responsibility and little care for the item or service being lent. PEP takes a different approach.

Our philosophy is **social interaction first, transaction second**. We believe people need to reconnect and strengthen their bonds through meaningful exchanges. A typical exchange works like this:

1. **Ask.** A user creates a post describing what they need and shares it with one or more of their groups. This is the first social step, the equivalent of saying "Hi, can anyone help me?"
2. **Offer.** Members of those groups see the post and can offer help by proposing one of their own objects, with details about it.
3. **Choose and agree.** The poster compares the offers, starts a conversation with a lender to sort out the details, and the two of them finalize the loan together.

Each step is designed on purpose to build engagement and responsibility, because we want our users to be driven by generosity, mindfulness and kindness.

On the technical side, the project gave us a foundation broad enough to build almost any module we wanted, so each team member could choose to work on what interested them personally and professionally.

## Instructions //Louis check

### 1. Prerequisites

- Docker with the Docker Compose plugin (`docker compose`)
- `make`
- `openssl` (used by the Makefile to generate secrets)
- A reasonably powerful machine. The stack runs about 15 containers (frontend, gateway, 7 backend services, PostgreSQL, Caddy, Drizzle Gateway, Prometheus, Grafana and Node Exporter), so the first build takes a while and uses a lot of memory.

### 2. Configuration

All configuration is read from a `.env` file at the repository root.

**Option A: let the Makefile generate it (recommended).** If no `.env` exists, `make` creates one with random secrets. An existing `.env` is never overwritten.

**Option B: write it yourself.** It must contain every variable below:

```env
POSTGRES_HOST=postgres
POSTGRES_DB=...
POSTGRES_USER=...
POSTGRES_PASSWORD=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
INTERNAL_API_KEY=...
GF_SECURITY_ADMIN_USER=...
GF_SECURITY_ADMIN_PASSWORD=...
GF_SERVER_ROOT_URL=https://pep.localhost:8443/grafana/
GF_SERVER_SERVE_FROM_SUB_PATH=true
```

> `POSTGRES_HOST` must stay `postgres` (the name of the database service in Docker Compose). The two `GF_SERVER_*` values are required for Grafana to work under `/grafana`.

### 3. Build and start

```sh
make
```

This builds and starts every container in the background.

Other useful commands:

| Command      | Effect                                                                                  |
|--------------|-----------------------------------------------------------------------------------------|
| `make logs`  | Follow the logs of all services                                                         |
| `make down`  | Stop all services                                                                       |
| `make re`    | `fclean`, then rebuild and start everything                                             |
| `make fclean`| Stop all services and prune **all** unused Docker images and build cache on the machine |
| `make hclean`| `fclean`, then prune Docker volumes. **This deletes the database.**                     |

### 4. Access the application

| Service           | URL                                         |
|-------------------|---------------------------------------------|
| Application       | https://pep.localhost:8443                  |
| API documentation | https://pep.localhost:8443/api/public/docs  |
| Grafana           | https://pep.localhost:8443/grafana          |
| Drizzle Studio    | http://localhost:4983 (via Drizzle Gateway) |

- **Certificate:** the HTTPS certificate is generated locally by Caddy, so your browser will show a security warning. Accept it to continue.
- **Grafana:** log in with `GF_SECURITY_ADMIN_USER` and `GF_SECURITY_ADMIN_PASSWORD` from `.env`.
- **Drizzle Studio:** connect using the Postgres credentials from `.env`, with host `postgres` and port `5432`.

### 5. Optional: seed data

The Bruno collections in `.bruno/` fill the database with test users, groups, objects and posts. Open them in the [Bruno](https://www.usebruno.com/) API client and run them against the running stack.

> `.bruno/` is gitignored, so you need to get a copy from a team member.

## Resources

### Main frameworks documentation

**Angular:** //Tiago

**Nest:** //Louis

**Docker:** //Louis

**Postgres:**
- Official documentation: https://www.postgresql.org/docs/current/

**Caddy:** //Louis

**Grafana:**
- Official documentation: https://grafana.com/docs/

**Prometheus:**
- Official documentation: https://prometheus.io/docs/introduction/overview/
- Node-exporter documentation: https://prometheus.io/docs/guides/node-exporter/

**Drizzle:** //Louis

**Zod:**
- Official documentation link: https://zod.dev/

**Tailwind:**
- Official documentation: https://tailwindcss.com/

### Others

**Figma:**
- https://www.figma.com/

**Websockets:**

- Socket.IO documentation: https://socket.io/docs/v4/
- NestJS WebSocket gateways: https://docs.nestjs.com/websockets/gateways

- //microservices ? //Louis
- //auth/login ? //Louis/Tiago
- //any (Anyone)

[...]

### Usage of AI

We used AI assistants throughout the project for **documentation, code review, code comprehension, repetitive tasks and debugging**.

- **Debugging.** Every team member had access to an AI model subscription. This was especially valuable for tracking down issues across a large, multi-service codebase.
- **Understanding each other's code.** AI helped us get up to speed on parts of the project written by other members, so we could stay productive and autonomous without taking up our teammates' time.
- **Tooling.** AI was used most heavily to build our testing and debugging tools, such as the Docker test containers and the Bruno collections that initialize the database.

We deliberately restricted AI use for writing application code and for performing git operations, so that every member understood and owned the code they submitted.

## Team Information

### Louis (lgirerd)
**Tech Lead, Backend & DevOps**
- Maintained the overall infrastructure
- Supervised backend changes
- Main pull request reviewer

### Tiago (tiaperei)
**Tech Lead, Full-Stack Developer**
- Maintained the Angular stack
- Supervised frontend changes
- Main pull request reviewer

### Alex (abonifac)
**Product Owner, Frontend Developer & Web Designer**
- Main creative driver of the application
- Designed the website
- Set the initial direction for features

### Tom (tfournie)
**Product Owner, Full-Stack Developer**
- Co-created the application concept
- Set the initial direction for features

### Raphael (rshin)
**Project Manager, Full-Stack Developer**
- Managed deadlines, meetings and team discussions
- Tracked and organized issues

## Project Management

**Organization.**
Work was first split by layer (frontend, backend, infrastructure), then progressively reassigned so that each member owned features end to end (see [Team Information](#team-information) and [Individual Contributions](#individual-contributions)). We tried a Trello board and weekly meetings early on but dropped them as the project took shape. Project management then focused on making sure everything ran smoothly, and stepping in only when something was unclear or blocked.

**Git workflow.**
Each feature or fix was developed on its own branch (`feat/…`, `fix/…`) and merged through a pull request. Commit messages follow a `type(scope): subject` convention, so the history shows which service each change touches.

**Tools.**

- **GitHub Issues** for task tracking
- **Discord** for day-to-day communication and task coordination

**Informal practices.**
Much of our coordination also happened in person: ad hoc meetings, discussions on the 42 campus and brainstorming sessions.

> "My role as project manager was to keep everyone aligned on priorities, check in regularly with each member to catch blockers early, and set a clear framework for our work, while keeping the team motivated."
> — Raphael

## Technical Stack //TIAGO, LOUIS

## Database Schema

All services share a single PostgreSQL database. The tables are created by [`backend/services/db/init.sql`](backend/services/db/init.sql), and each service accesses only the tables it needs through its own Drizzle schema (`src/database/schema.ts`).

### Overview

```
                 ┌──────────┐
     ┌──────────►│  GROUPS  │◄─────────────┐
     │  member   └──────────┘   shared to  │
     │                                     │
┌─────────┐   owns    ┌──────────┐   ┌─────────┐
│  USERS  │──────────►│ OBJECTS  │   │  POSTS  │◄──────┐
└─────────┘           └──────────┘   └─────────┘       │
  │     │                  │              │            │
  │     │ lender/borrower  │ the item     │ the        │
  │     └─────────────────►▼◄─────────────┘ request    │
  │                  ┌──────────┐                      │
  │                  │ LENDING  │  = one loan          │
  │                  └──────────┘                      │
  │                                                    │ about
  │ talks in        ┌───────────────┐                  │
  └────────────────►│ CONVERSATIONS │──────────────────┘
                    └───────┬───────┘
                            │ contains
                            ▼
                        MESSAGES
```

| Table | Purpose |
|---|---|
| `users` | People with an account. `deleted_at` is set when they delete their account (the row is kept). |
| `groups` | Circles of people who trust each other (family, neighbours). Each has an owner. |
| `group_members` | Who belongs to which group, as `admin` or `member`. |
| `objects` | Things a user owns and can lend (a drill, a ladder), with a condition and an availability flag. |
| `posts` | "I need X between these dates" requests, visible only to the groups they're shared with. |
| `post_groups` | Which groups each post is shared with. |
| `lending` | One loan of one object from a lender to a borrower for a date range, with a status, answering one post. |
| `conversations` | A private chat about a post. |
| `conversation_members` | Who takes part in each conversation. |
| `messages` | The messages sent in a conversation. |
| `refresh_tokens` | Login sessions, so a refresh token can be revoked server-side. |
| `api_keys` | Keys for the public API. Only a hash of each key is stored. |

### Relationships

- A **user** owns many **objects**, **posts** and **groups**, and belongs to many groups through **group_members** (unique per group and user).
- A **post** is shared with one or more **groups** through **post_groups** (unique per post and group).
- A **lending** row links one **object**, a **lender** and a **borrower** (both users), and the **post** it answers.
- A **conversation** is about one **post**, has its participants in **conversation_members**, and holds its **messages**.
- `conversations.post_id` has no foreign key: posts belong to another service, so the chats service fetches the post's title from the posts service, and a conversation is kept when its post is deleted.
- Unless noted otherwise, foreign keys use `ON DELETE CASCADE`. In practice users, objects, groups and posts are soft-deleted (`deleted_at`), so the rows stay and every query filters them out.

### Key fields and data types

Every table has an `id SERIAL PRIMARY KEY`, and most have `created_at` / `updated_at` (`TIMESTAMPTZ`). Foreign keys are `INTEGER`, and soft-deleted tables have a `deleted_at TIMESTAMPTZ`.

| Table | Key fields |
|---|---|
| `users` | `username`, `email` `CITEXT` (unique, case-insensitive) · `h_password` `VARCHAR(255)` (hash only) |
| `objects` | `name` `VARCHAR(30)` · `type` `object_type` (`DIY`, `Electronics`, `Leisure`, `Other`) · `condition` `object_condition` (`new`, `good`, `worn`) · `is_available` `BOOLEAN` |
| `groups` | `name` `VARCHAR(30)` · `description` `VARCHAR(500)` · `owner_id` → `users` |
| `group_members` | `group_id`, `user_id` (unique together) · `role` `group_role` (`admin`, `member`) |
| `posts` | `title` `VARCHAR(60)` · `object_type` · `status` `post_status` (`open`, `closed`) · `from_date`, `to_date` `TIMESTAMPTZ` (`to_date > from_date`) |
| `post_groups` | `post_id`, `group_id` (unique together) |
| `lending` | `object_id`, `lender_id`, `borrower_id`, `post_id` · `object_name` `VARCHAR(30)`, `post_title` `VARCHAR(60)` (copied at creation) · `status` `lending_status` (`pending`, `accepted`, `active`, `awaiting_confirmation`, `returned`, `rejected`, `cancelled`, `overdue`) · `lended_from`, `lended_to` `TIMESTAMPTZ` · `message` `VARCHAR(250)` · handover timestamps · exclusion constraints: no overlapping dates for the same object once accepted (`no_overlap`), no duplicate pending offers (`no_duplicate_pending`) |
| `conversations` | `post_id` (no foreign key) |
| `conversation_members` | `conversation_id`, `user_id` (unique together) |
| `messages` | `conversation_id` · `owner_id` (sender) · `content` `TEXT` |
| `refresh_tokens` | `jti` `UUID` (unique) · `revoked` `BOOLEAN` · `expires_at` `TIMESTAMPTZ` |
| `api_keys` | `name` `VARCHAR(50)` · `prefix` `VARCHAR(16)` · `key_hash` `VARCHAR(64)` (unique, the key itself is never stored) · `last_used_at`, `revoked_at` `TIMESTAMPTZ` |

## Features List

### Main Features

**Authentication** *(lgirerd, tiaperei)*

- Registration and login, with form validation on both the frontend and the backend
- Short-lived JWT access tokens and revocable refresh tokens stored in an httpOnly cookie
- Silent token refresh: an expired access token is renewed automatically without logging the user out
- Logout, which revokes the refresh token
- Protected routes: pages under `/app` are only reachable when logged in

**Users** *(lgirerd, rshin, tfournie, abonifac)*

- Profile page and profile editing, including changing the username
- User lookup by username, used to add people to groups
- Account deletion: the user is soft-deleted, their posts are closed, their objects are deleted, their open loans are cancelled and the groups they own are handed over

**Objects** *(rshin, tiaperei, tfournie, abonifac)*

- A personal catalog of objects, each with a name, category, condition, description and availability
- Create, edit and delete objects; only the owner can modify them
- Search, category filters, sorting and pagination in the catalog

**Groups** *(rshin, tiaperei, abonifac, tfournie)*

- Create, edit and delete groups
- Invite-only groups: members are added by the group's admins
- Three levels of permission: **owner**, **admin** and **member**
  - The owner and admins can add or remove members, promote or demote admins, and edit the group
  - Only the owner can delete the group
- Members can leave a group. If the owner leaves, ownership passes automatically to the longest-standing member; if no other member remains, the group is deleted.

**Posts** *(rshin, tiaperei, abonifac)*

- Requests for help with a title, category, description and the period the object is needed for
- Shared with one or more groups and visible only to members of those groups
- A feed of open requests from the user's groups, and a list of the user's own requests
- Create, edit and delete requests; a request is closed once a loan is agreed

**Lending** *(lgirerd, tiaperei)*

- A group member answers a request by offering one of their objects
- The poster accepts or rejects offers. Accepting one rejects the other offers on the request and closes it.
- An object can't be booked twice for overlapping periods, enforced by the database
- Full loan lifecycle: offered (`pending`), accepted, picked up (`active`), given back by the borrower, and return confirmed by the lender (`returned`). An offer can also be cancelled.
- A dashboard of the user's offers, requests and ongoing loans

**Chats** *(tfournie, lgirerd)*

- Each conversation is tied to a post, so the person asking and the people offering help can sort out the details
- Real-time delivery of new conversations and messages over WebSockets (Socket.IO)
- Message history for each conversation

**User Analytics** *(rshin, abonifac)*

- A dashboard showing each user their activity: objects (total, available), requests (open, closed, top category), groups and neighbours, conversations and busiest day, loans (lent, borrowed, requests answered)

**Public API** *(lgirerd)*

- REST endpoints to list, read, create, update and delete objects (`/api/public/v1/objects`)
- Users create, list and revoke their own API keys (up to 10). Keys are stored hashed, and the full key is shown only once.
- Rate limiting on every public endpoint
- Interactive Swagger documentation at `/api/public/docs`, with an OpenAPI spec and a Postman collection

**Interface** *(abonifac)*

- A custom design system with reusable components (buttons, cards, modals, text fields, badges, date picker…), its own color palette, typography and icons
- Separate layouts for the public site and the app, with desktop and mobile headers
- Landing page, help & support page, Privacy Policy, Terms of Service and a 404 page

**Infrastructure** *(lgirerd)*

- Backend split into microservices (auth, users, objects, groups, posts, lending, chats) behind an API gateway, all running with Docker Compose
- Services communicate through internal HTTP calls and events (e.g. `user.deleted`)
- HTTPS through a Caddy reverse proxy

**Monitoring** *(rshin)*

- Prometheus collects metrics from the API gateway (request rate and latency per service) and from the host through Node Exporter (CPU, memory)
- A Grafana dashboard, provisioned automatically and served at `/grafana`
- Alert rules for a service going down, high gateway latency and spikes in failed logins

## Modules

### 1. Web Modules, total = 9pts

- Major: Use a framework for both the frontend and backend (lgirerd, tiaperei) + 2pts
  - **Why:** frameworks give us routing, dependency injection and a consistent structure across a large codebase shared by five people.
  - **How:** Angular 22 for the frontend; NestJS 11 for the gateway and every backend service.

- Major: Implement real-time features using WebSockets or similar technology (tfournie) + 2pts
  - **Why:** chat messages and new conversations must appear instantly, without reloading.
  - **How:** a Socket.IO gateway in the chats service checks the JWT on connection, puts each user in one room per conversation and broadcasts new messages to it; the client reconnects with a fresh token and resyncs missed messages.

- Major: A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints (lgirerd) + 2pts
  - **Why:** lets users manage their objects from scripts or other tools, outside the web app.
  - **How:** 6 endpoints under `/api/public/v1/objects` (GET, POST, PUT, DELETE), API keys sent in `x-api-key` and stored as SHA-256 hashes, 60 requests per minute enforced by the gateway, Swagger documentation at `/api/public/docs`.

- Minor: Use an ORM for the database (lgirerd) + 1pt
  - **Why:** typed queries catch schema mistakes at compile time and protect against SQL injection.
  - **How:** Drizzle ORM with `postgres-js`; each service declares only the tables it uses in its own `schema.ts`.

- Minor: Custom-made design system with reusable components, including a proper color palette, typography, and icons (abonifac) + 1pt
  - **Why:** a consistent look across every page, built once and reused.
  - **How:** Tailwind theme tokens for colors and typography in `styles.css`, 26 reusable Angular components (buttons, cards, modals, text fields, date picker…) and an SVG icon set.

- Minor: Implement advanced search functionality with filters, sorting, and pagination. (tfournie) + 1pt
  - **Why:** users need to find an object quickly in a growing catalog.
  - **How:** accent-insensitive search on name and description, category filters, A–Z / Z–A sorting and pagination in the catalog.

### 2. Accessibility and Internationalization, total = 1pt

- Minor: Support for additional browsers (abonifac) + 1pt //ALEX
  - **Why:** neighbours use different browsers, not only Chrome.
  - **How:** every feature tested and fixed on [browsers]; known limitations: [limitations]. //ALEX

### 3. User Management, total = 5pts

- Major: Advanced permissions system (rshin, abonifac, tfournie) + 2pts
  - **Why:** group creators keep control, trusted members help manage, others only use the group.
  - **How:** owner, admin and member roles per group, enforced by NestJS guards (`GroupMemberGuard`, `GroupAdminGuard`, `GroupOwnerGuard`); the frontend shows management controls only to admins and deletion only to the owner.

- Major: An organization system (rshin, abonifac, tfournie) + 2pts
  - **Why:** groups are the core of PEP: requests are only visible to the groups they're shared with.
  - **How:** a `groups` microservice to create, edit and delete groups, add, remove or leave members, with ownership handed over when the owner leaves.

- Minor: User activity analytics and insights dashboard (rshin, abonifac) + 1pt
  - **Why:** shows users how they take part in their community.
  - **How:** each service exposes `GET /api/<service>/stats`, displayed on an Angular page with stat cards and a donut chart.

### 7. Devops, total = 4pts

- Major: Monitoring system with Prometheus and Grafana (rshin) + 2pts
  - **Why:** one place to check that every microservice is up and responsive, with alerts when it isn't.
  - **How:** Prometheus scrapes the gateway and Node Exporter; Grafana is provisioned with a dashboard and 3 alert rules (target down, high P95 latency, failed login spike), reachable only through Caddy over HTTPS with a login.

- Major: Backend as microservices (lgirerd) + 2pts
  - **Why:** each domain can be developed, deployed and restarted independently, which fits a team where each member owns services.
  - **How:** seven NestJS services (auth, users, objects, groups, posts, lending, chats) behind a gateway; each one only accesses its own tables and talks to the others through internal REST endpoints and events such as `user.deleted`.

### Bonus Modules

The modules above total 19 points: 14 required + 5 bonus, the maximum. Any module listed below is a backup in case one is not validated.

- Major: //any (anyone) + 2pts // TIAGO
- Minor: //any (anyone) + 1pt //ALEX

## Individual Contributions

### Louis (lgirerd)

**Backend**
- Authentication and users services
- Microservice architecture
- Lending service
- Zod validation

**Infrastructure**
- Makefile and Docker infrastructure
- Setup and maintenance of Caddy, PostgreSQL, Drizzle Gateway and NestJS

**Challenges** //LOUIS
- **Challenge 1.** *Solution:*
- **Challenge 2.** *Solution:*

### Tiago (tiaperei)

**Frontend**
- Angular setup and maintenance
- Modals
- Login and registration
- Page wiring

**Full-stack**
- Transaction system (lending service), the core feature of the application

**Challenges** //TIAGO
- **Challenge 1.** *Solution:*
- **Challenge 2.** *Solution:*

### Alex (abonifac)

**Design**
- Original concept of the application
- Website UI/UX
- Interactive Figma prototype

**Frontend**
- Web integration (HTML, CSS)
- Styled UI components
- Page wiring

**Challenges** //ALEX
- **Challenge 1.** *Solution:*
- **Challenge 2.** *Solution:*

### Tom (tfournie)

**Design**
- Co-creator of the application concept

**Frontend**
- Page wiring

**Full-stack**
- Chat system

**Challenges** //TOM
- **Challenge 1.** *Solution:*
- **Challenge 2.** *Solution:*

### Raphael (rshin)

**Backend**
- Groups/Object/Posts services
- Group roles and permission guards

**Frontend**
- Page wiring

**Infrastructure**
- Monitoring with Prometheus and Grafana

**Challenges**
- **Evolving the backend once services were wired together.** The first architecture didn't anticipate every need, so later changes had to fit services already calling each other without rewriting too much code, and the split between internal, public and shared code isn't consistent across services. *Solution:* targeted fixes, such as lookup variants (`findByIdOrThrow`, `findLiveByIdOrThrow`) and route guards added afterwards.
- **Splitting roles.** With work divided by layer, frontend-only members didn't always know what the backend had to account for, and some features were split between three people (styling, wiring, endpoints), blurring who should fix them. *Solution:* responsibilities were reassigned along the way, with each member encouraged to own a feature end to end (backend and frontend) and to stay flexible about switching areas when needed.

