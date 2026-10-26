# URL Shortener

A modern full-stack URL shortener application built with a React frontend and a Node.js/Express backend.

## Architecture

This project is organized as a monorepo with two main directories:

- `/client` - The frontend web application
- `/server` - The backend REST API

### Tech Stack

#### Frontend (`/client`)

- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS v4
- **State Management:** Redux Toolkit & React Query
- **Routing:** React Router v8
- **HTTP Client:** Axios

#### Backend (`/server`)

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** JWT (JSON Web Tokens) & bcrypt
- **Validation:** Zod
- **ID Generation:** nanoid

## Deployment

The frontend and backend are hosted separately and talk over the public internet:

| Piece     | Host   | Role                                                                   |
| --------- | ------ | ---------------------------------------------------------------------- |
| `/client` | Vercel | Static React build (SPA). Serves the UI and calls the API.             |
| `/server` | VPS    | Express + PostgreSQL + Redis. Handles `/api/*`, auth cookies, and the `/:short_code` redirects. |

Pushes to `main` that touch the server or dependencies run the unit suite first: the `test` job must pass before `build-and-deploy` starts.

### Frontend (Vercel)

- Build command: `pnpm build` (outputs to `client/dist`; see `client/vercel.json` for the SPA rewrite).
- Set in the Vercel project's env vars (not just local `.env`):
  - `VITE_API_BASE_URL=https://your-api-domain.com` — the VPS backend. Short links are built as `{base}/<code>`, so this must be the domain that serves the redirects.

### Backend (VPS)

- Set `CLIENT_URL=https://your-vercel-domain.com` in the server's `.env` so CORS accepts requests from the frontend. A comma-separated list is supported if you also run staging.
- Run behind Nginx/Caddy with HTTPS. Production auth uses a `SameSite=None; Secure` refresh cookie, so **TLS is required** or logins will fail.

## Getting Started

### Prerequisites

- Node.js
- pnpm (recommended) or npm
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies for the server:
   ```bash
   cd server
   pnpm install
   ```
3. Install dependencies for the client:
   ```bash
   cd ../client
   pnpm install
   ```

### Running Locally

**Start the Server:**

```bash
cd server
pnpm run dev
```

**Start the Client:**

```bash
cd client
pnpm run dev
```

## Testing

The server has a unit suite built on Node's built-in test runner (`node:test` and `node:assert/strict`) — no Jest or Vitest.

```bash
pnpm --filter server test
```

Run a single suite:

```bash
cd server
node --test test/links.validation.test.js
```

The 57 tests cover auth and link validation, JWT and bcrypt helpers, refresh-token hashing, client metadata, OTP generation, and cookie flags. They need no database, Redis, or SMTP connection.

## Features

- Create, manage, and track shortened URLs
- User authentication and authorization
- Secure API with data validation
- Fast and responsive user interface
