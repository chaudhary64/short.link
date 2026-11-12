# short.link — Server API

A REST API for shortening URLs, built with **Express**, **Drizzle ORM**, **PostgreSQL**, **Redis**, and **JWT authentication**.

Base URL: `http://localhost:3000`

---

## Getting Started

### Prerequisites

- Node.js 24
- PostgreSQL (e.g. Neon)
- Redis
- pnpm

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Apply the schema (db-push is the only schema path)
pnpm db-push

# 4. Start the dev server
pnpm dev
```

### Environment Variables

| Variable                       | Description                                                              |
| ------------------------------ | ------------------------------------------------------------------------ |
| `NODE_ENV`                     | `development` or `production`; production enables secure refresh cookies |
| `PORT`                         | API port (defaults to `3000`)                                            |
| `CLIENT_URL`                   | Comma-separated allowed frontend origins (CORS, email links, redirects)  |
| `SERVER_URL`                   | Public API URL used to build password-reset links                        |
| `DATABASE_URL`                 | PostgreSQL connection string                                             |
| `REDIS_HOST`                   | Redis host                                                               |
| `REDIS_PORT`                   | Redis port                                                               |
| `REDIS_USERNAME`               | Redis username (optional)                                                |
| `REDIS_PASSWORD`               | Redis password (optional)                                                |
| `REDIS_TTL`                    | Short-link cache TTL in seconds                                          |
| `ACCESS_TOKEN_SECRET`          | Secret for signing JWT access tokens (15 min expiry)                     |
| `REFRESH_TOKEN_SECRET`         | Secret for signing JWT refresh tokens (7 day expiry)                     |
| `RESET_PASSWORD_TOKEN_SECRET`  | Secret for signing password-reset tokens (15 min expiry)                 |
| `NANOID_SIZE`                  | Length of generated short codes (defaults to `8`, capped at `21`)        |
| `VISITOR_HASH_SALT`            | Salt for visitor hashes (defaults to a built-in development salt)        |
| `SMTP_HOST`                    | SMTP server hostname                                                     |
| `SMTP_PORT`                    | SMTP server port                                                         |
| `SMTP_SECURE`                  | Set to `true` to connect with TLS                                        |
| `SMTP_USER`                    | SMTP username                                                            |
| `SMTP_PASSWORD`                | SMTP password                                                            |
| `SMTP_FROM_EMAIL`              | From address used for outgoing mail                                      |

---

## Authentication

Protected routes require a valid **access token** in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Tokens are obtained from the `/auth/login` or `/auth/signup` responses.  
Use `GET /refresh` to silently rotate tokens before the access token expires.

---

## Routes

### Public — `/api/auth`

| Method | Endpoint             | Body                        | Response                                                                    |
| ------ | -------------------- | --------------------------- | --------------------------------------------------------------------------- |
| `POST` | `/api/auth/register` | `{ name, email, password }` | `201` — `{ user, accessToken, refreshToken }` + sets `refresh_token` cookie |
| `POST` | `/api/auth/login`    | `{ email, password }`       | `200` — `{ user, accessToken, refreshToken }` + sets `refresh_token` cookie |
| `POST` | `/api/auth/logout`   | —                           | `200` — clears `refresh_token` cookie and invalidates the session           |

---

### Protected — `/api/auth` 🔒

> Requires `Authorization: Bearer <accessToken>` header.  
> The user identity is taken from the token — no need to send an `id` field.

| Method   | Endpoint       | Body       | Response                               |
| -------- | -------------- | ---------- | -------------------------------------- |
| `PUT`    | `/api/auth/me` | `{ name }` | `200` — `{ user }` updated user object |
| `DELETE` | `/api/auth/me` | —          | `200` — `{ user }` deleted user object |

---

### Protected — `/api/links` 🔒

> All link routes require `Authorization: Bearer <accessToken>`.  
> Ownership is enforced — you can only edit or delete your own links.

| Method   | Endpoint                | Body / Path       | Response                                                    |
| -------- | ----------------------- | ----------------- | ----------------------------------------------------------- |
| `GET`    | `/api/links`            | —                 | `200` — `{ links }` array of the authenticated user's links |
| `POST`   | `/api/links`            | `{ originalUrl }` | `200` — `{ link }` newly created link with short code       |
| `PUT`    | `/api/links/:id`        | `{ originalUrl }` | `200` — `{ link }` updated link object                      |
| `PATCH`  | `/api/links/:id/status` | `{ status }`      | `200` — `{ link }` updated link status                      |
| `DELETE` | `/api/links/:id`        | `path: :id`       | `200` — `{ link }` deleted link object                      |

---

### Protected — `/api/keys` 🔒

> Managed with a browser session. API keys are refused here, so a key cannot mint or revoke other keys.

| Method   | Endpoint        | Body               | Response                                                            |
| -------- | --------------- | ------------------ | ------------------------------------------------------------------- |
| `GET`    | `/api/keys`     | —                  | `200` — `{ apiKeys }` with prefix, scopes and usage, never the hash |
| `POST`   | `/api/keys`     | `{ name, scopes }` | `201` — `{ apiKey, token }`; the plaintext token is shown once      |
| `DELETE` | `/api/keys/:id` | —                  | `200` — `{ apiKey }` with `revoked_at` set, else `404`              |

### Token Refresh — `/api/auth/refresh`

| Method | Endpoint            | Cookie                            | Response                                                                 |
| ------ | ------------------- | --------------------------------- | ------------------------------------------------------------------------ |
| `GET`  | `/api/auth/refresh` | `refresh_token` (httpOnly cookie) | `200` — `{ accessToken, refreshToken }` + rotates `refresh_token` cookie |

> Token rotation is applied: the old session is invalidated and a new one is created on every refresh.

---

### Short-link Redirect — Public

| Method | Endpoint       | Response                                       |
| ------ | -------------- | ---------------------------------------------- |
| `GET`  | `/:short_code` | `301` — permanent redirect to the original URL |

> Example: `GET /abc12345` → redirects to `https://example.com/some/long/path`

---

## Error Responses

| Status | Meaning                                                     |
| ------ | ----------------------------------------------------------- |
| `400`  | Missing required field (e.g. no `originalUrl`, no `linkId`) |
| `401`  | Unauthorized — missing, invalid, or expired token or API key |
| `403`  | Forbidden — you do not own this resource, the API key lacks the required scope, or an API key is used on an account route |
| `404`  | Resource not found                                          |
| `409`  | Conflict — user with that email already exists              |
| `500`  | Internal server error                                       |

---

## Project Structure

```
server/
├── app.js                          # Express app (middleware, CORS, routers)
├── index.js                        # Server bootstrap
├── config/
│   └── mailer.js                   # SMTP transport; validates required env vars
├── controllers/
│   ├── analytics/get.controller.js # Dashboard analytics aggregation
│   ├── auth/                       # Signup, login, logout, refresh, OAuth,
│   │                               # password reset, email change, sessions
│   ├── apiKey/                     # Create, list and revoke API keys
│   ├── link/                       # Create, edit, delete, status, alias,
│   │                               # guest-link creation and conversion
│   ├── redirect/get.controller.js  # Short-code redirect handling
│   └── refresh/get.controller.js   # Refresh-token rotation
├── db/
│   └── index.js                    # Drizzle (PostgreSQL) and Redis clients
├── emails/                         # EJS HTML/text email templates
├── middlewares/
│   ├── authenticate.middleware.js  # JWT or API-key verification
│   ├── rejectApiKey.middleware.js  # Blocks API keys on account routes
│   ├── requireScope.middleware.js  # read / write scope guard for API keys
│   ├── cache.middleware.js         # Redis-backed short-code lookup
│   └── rateLimit.middleware.js     # In-memory per-IP rate limiting
├── models/                         # Drizzle table schemas
│   ├── analytics.schema.js
│   ├── apiKeys.schema.js
│   ├── links.schema.js
│   ├── schema.js
│   ├── sessions.schema.js
│   └── user.schema.js
├── repositories/
│   ├── analytics.repository.js     # Click aggregation queries
│   ├── apiKey.repository.js        # API key hashing, lookup, revocation
│   ├── links.repository.js         # Link CRUD and Redis caching
│   ├── session.repository.js       # Session lifecycle and token hashing
│   └── user.repository.js          # User CRUD
├── routes/
│   ├── analytics.routes.js
│   ├── auth.routes.js
│   ├── keys.routes.js              # /api/keys
│   └── links.routes.js
├── services/
│   ├── email.service.js            # Template rendering and delivery
│   ├── guest.service.js            # Guest-link documents and migration
│   ├── token.service.js            # Session creation and token issuance
│   └── verification.service.js     # OTP generation and storage
├── utils/
│   ├── apiKey.js                   # Key generation, hashing, scopes
│   ├── clientInfo.js               # User-agent, geo, and visitor hashing
│   ├── cookie.js                   # Environment-aware refresh cookie options
│   ├── hash.js                     # bcrypt helpers
│   └── tokens.js                   # JWT sign/verify helpers
├── validations/
│   ├── apiKey.validation.js        # Zod schemas for API key creation
│   ├── auth.validation.js          # Zod schemas for auth payloads
│   └── links.validation.js         # Zod schemas for link payloads
└── views/
    └── forgot-password.ejs         # Server-rendered password-reset page
```
