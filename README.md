*This project has been created as part of the 42 curriculum by rshin, abonifac, tfournie, tiaperei, lgirerd*

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

**Tailwind:** //Alex

### Others

- //websockets ? //Tom
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

## Project Management //TODO Raphael

**Approach.** We tried several management practices early on, including a Trello board and weekly meetings, but dropped them as the project took shape. // TODO: list the other abandoned practices and why they were dropped

Because responsibilities were clearly divided between members, trusting each person's workflow and progress worked better than heavy coordination. Project management therefore focused on making sure everything ran smoothly and stepping in only when something was unclear or blocked.

**Tools.**

- **GitHub Issues** for task tracking
- **Discord** for day-to-day communication and task coordination

**Informal practices.** Much of our coordination also happened in person: ad hoc meetings, discussions on the 42 campus and brainstorming sessions.

> "As project manager, I took personal responsibility for keeping the team informed, staying attentive to the group's overall morale, checking in with each member, organizing team leisure activities, and taking the lead in setting direction and providing a clear framework for our work."
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
  │     │ lender/borrower  │ the item     │ (optional) │
  │     └─────────────────►▼◄─────────────┘ the request│
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
| `lending` | One loan of one object from a lender to a borrower for a date range, with a status. It can be linked to the post it answers. |
| `conversations` | A private chat about a post. |
| `conversation_members` | Who takes part in each conversation. |
| `messages` | The messages sent in a conversation. |
| `refresh_tokens` | Login sessions, so a refresh token can be revoked server-side. |
| `api_keys` | Keys for the public API. Only a hash of each key is stored. |

### Relationships

- A **user** owns many **objects**, **posts** and **groups**, and belongs to many groups through **group_members** (unique per group and user).
- A **post** is shared with one or more **groups** through **post_groups** (unique per post and group).
- A **lending** row links one **object**, a **lender** and a **borrower** (both users), and optionally the **post** it answers.
- A **conversation** is about one **post**, has its participants in **conversation_members**, and holds its **messages**.
- `conversations.post_id` has no foreign key: posts belong to another service, so the chats service fetches the post's title from the posts service, and a conversation is kept when its post is deleted.
- Unless noted otherwise, foreign keys use `ON DELETE CASCADE`. In practice users, objects, groups and posts are soft-deleted (`deleted_at`), so the rows stay and every query filters them out.

### Key fields and data types

Every table has an `id SERIAL PRIMARY KEY`, and most have `created_at` / `updated_at` (`TIMESTAMPTZ`, default `NOW()`).

**users**

| Field | Type | Notes |
|---|---|---|
| `username` | `CITEXT` | Unique, case-insensitive |
| `email` | `CITEXT` | Unique, case-insensitive |
| `h_password` | `VARCHAR(255)` | Hashed password, never the plain text |
| `deleted_at` | `TIMESTAMPTZ` | Soft delete |

**objects**

| Field | Type | Notes |
|---|---|---|
| `owner_id` | `INTEGER` | → `users.id` |
| `name` | `VARCHAR(30)` | |
| `type` | `object_type` | `DIY`, `Electronics`, `Leisure`, `Other` |
| `description` | `VARCHAR(500)` | |
| `condition` | `object_condition` | `new`, `good`, `worn` |
| `is_available` | `BOOLEAN` | Default `true` |
| `deleted_at` | `TIMESTAMPTZ` | Soft delete |

**groups** and **group_members**

| Table | Field | Type | Notes |
|---|---|---|---|
| `groups` | `owner_id` | `INTEGER` | → `users.id` |
| `groups` | `name` | `VARCHAR(30)` | |
| `groups` | `description` | `VARCHAR(500)` | |
| `groups` | `deleted_at` | `TIMESTAMPTZ` | Soft delete |
| `group_members` | `group_id`, `user_id` | `INTEGER` | → `groups.id`, `users.id`; unique together |
| `group_members` | `role` | `group_role` | `admin` or `member` (default `member`) |

**posts** and **post_groups**

| Table | Field | Type | Notes |
|---|---|---|---|
| `posts` | `owner_id` | `INTEGER` | → `users.id` |
| `posts` | `title` | `VARCHAR(60)` | |
| `posts` | `object_type` | `object_type` | Category of the object needed |
| `posts` | `description` | `VARCHAR(500)` | |
| `posts` | `status` | `post_status` | `open` or `closed` (default `open`) |
| `posts` | `from_date`, `to_date` | `TIMESTAMPTZ` | `CHECK (to_date > from_date)` |
| `posts` | `deleted_at` | `TIMESTAMPTZ` | Soft delete |
| `post_groups` | `post_id`, `group_id` | `INTEGER` | → `posts.id`, `groups.id`; unique together |

**lending**

| Field | Type | Notes |
|---|---|---|
| `object_id` | `INTEGER` | → `objects.id` |
| `lender_id`, `borrower_id` | `INTEGER` | → `users.id` |
| `post_id` | `INTEGER` | → `posts.id`, optional |
| `status` | `lending_status` | Default `created` (see below) |
| `lended_from`, `lended_to` | `TIMESTAMPTZ` | Loan period |
| `message` | `VARCHAR(250)` | Note sent with the offer |
| `picked_up_at`, `borrower_returned_at`, `lender_confirmed_returned_at` | `TIMESTAMPTZ` | Handover timestamps |

`lending_status` is `created`, `pending`, `accepted`, `active`, `awaiting_confirmation`, `returned`, `disputed`, `rejected`, `cancelled` or `overdue`. Two exclusion constraints protect the bookings:

- `no_overlap`: the same object can't have two loans with overlapping dates while they are `accepted`, `active`, `awaiting_confirmation` or `overdue`.
- `no_duplicate_pending`: the same lender can't send the same borrower two pending offers for the same object and overlapping dates.

**conversations**, **conversation_members** and **messages**

| Table | Field | Type | Notes |
|---|---|---|---|
| `conversations` | `post_id` | `INTEGER` | The post the conversation is about (no foreign key) |
| `conversation_members` | `conversation_id`, `user_id` | `INTEGER` | → `conversations.id`, `users.id`; unique together |
| `messages` | `conversation_id` | `INTEGER` | → `conversations.id` |
| `messages` | `owner_id` | `INTEGER` | → `users.id`, the sender |
| `messages` | `content` | `TEXT` | |

**refresh_tokens** and **api_keys**

| Table | Field | Type | Notes |
|---|---|---|---|
| `refresh_tokens` | `jti` | `UUID` | Unique token id, matched against the cookie's token |
| `refresh_tokens` | `user_id` | `INTEGER` | → `users.id` |
| `refresh_tokens` | `revoked`, `expires_at` | `BOOLEAN`, `TIMESTAMPTZ` | |
| `api_keys` | `user_id` | `INTEGER` | → `users.id` |
| `api_keys` | `name`, `prefix` | `VARCHAR(50)`, `VARCHAR(16)` | Shown to the user to identify the key |
| `api_keys` | `key_hash` | `VARCHAR(64)` | Unique; the key itself is never stored |
| `api_keys` | `last_used_at`, `revoked_at` | `TIMESTAMPTZ` | |

## Features List

### Main Features

**Users & Authentication** //Louis

- A complete authentication service: registration and login with short-lived JWT access tokens and revocable refresh tokens stored in an httpOnly cookie *(lgirerd: backend; tiaperei: login and registration pages)*
- Profile editing, including changing the username *(lgirerd: backend; tfournie, abonifac: profile pages)*
- Account deletion: the user is soft-deleted, their posts are closed, their objects are marked unavailable, their open loans are cancelled and the groups they own are handed over *(rshin, lgirerd)*
- [...]

**Objects**

- A personal catalog of objects that each user can offer when answering a request *(rshin, lgirerd: backend; abonifac, rshin, tiaperei: object form)*
- Search, category filters, sorting and pagination in the catalog *(tfournie, abonifac)*

**Groups**

*(rshin, lgirerd: backend; tfournie, abonifac, rshin: frontend)*

- Invite-only groups: members are added by the group's admins
- Three levels of permission: **owner**, **admin** and **member**
  - The owner and admins can add or remove members, promote or demote admins, and edit the group
  - Only the owner can delete the group
  - Members can view the group's details or leave it
- If the owner leaves, ownership passes automatically to the longest-standing member. If no other member remains, the group is deleted.

**Posts & Lending** //Tiago

- Posts (requests for help) can be shared with one or more groups and are visible only to members of those groups *(rshin: backend; tiaperei, abonifac: frontend)*
- Each loan between a lender and a borrower is tracked as an exchange. A group member offers an object (`pending`), the poster accepts or rejects it, and the lender confirms when the object comes back (`returned`). An offer can also be cancelled. *(lgirerd: backend; tiaperei: dashboard, offer and request pages)*
- [...]

**Chats** //Tom

- Real-time messaging built on WebSockets (Socket.IO) *(tfournie, lgirerd)*
- Each conversation is tied to a post, so the person asking and the people offering help can sort out the details *(tfournie, lgirerd)*
- [...]

**User Analytics**

- A dashboard showing each user their activity and usage statistics (totals, most frequent interactions, ratios, etc.) *(rshin: statistics endpoints and wiring; abonifac: page design)*

[...] //any

## Modules //RAPHAEL

### 1. Web Modules, total = 8pts

- Major: Use a framework for both the frontend and backend (lgirerd, tiaperei) + 2pts
- Major: Implement real-time features using WebSockets or similar technology (tfournie) + 2pts
- Major: A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints (lgirerd) + 2pts
- Minor: Use an ORM for the database (lgirerd) + 1pt
- Minor: Custom-made design system with reusable components, including a proper color palette, typography, and icons (abonifac) + 1pt

### 2. Accessibility and Internationalization, total = 1pt

- Minor: Support for additional browsers (abonifac) + 1pt

### 3. User Management, total = 5pts

- Major: Advanced permissions system (rshin, abonifac, tfournie) + 2pts
- Major: An organization system (rshin, abonifac, tfournie) + 2pts
- Minor: User activity analytics and insights dashboard (rshin, abonifac) + 1pt

### 7. Devops, total = 4pts

- Major: Monitoring system with Prometheus and Grafana (rshin) + 2pts
- Major: Backend as microservices (lgirerd) + 2pts

### Bonus Modules, total = //5pts?

- Major: //any (anyone) + 2pts
- Minor: //any (anyone) + 1pt

## Individual Contributions //ALEX, TOM, LOUIS, TIAGO, RAPHAEL

### Louis (lgirerd)

**Backend**
- Authentication and users services
- Microservice architecture
- Lending service
- Zod validation

**Infrastructure**
- Makefile and Docker infrastructure
- Setup and maintenance of Caddy, PostgreSQL, Drizzle Gateway and NestJS

### Tiago (tiaperei)

**Frontend**
- Angular setup and maintenance
- Modals
- Login and registration
- Page wiring

**Full-stack**
- Transaction system (lending service), the core feature of the application

### Alex (abonifac)

**Design**
- Original concept of the application
- Website UI/UX
- Interactive Figma prototype

**Frontend**
- Page wiring
- Styled UI components

### Tom (tfournie)

**Design**
- Co-creator of the application concept

**Frontend**
- Page wiring

**Full-stack**
- Chat system

### Raphael (rshin)

**Backend**
- Groups service
- Objects service
- Posts service

**Frontend**
- Page wiring

**Infrastructure**
- Monitoring with Prometheus and Grafana
