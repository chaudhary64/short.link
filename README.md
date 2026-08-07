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

## Features

- Create, manage, and track shortened URLs
- User authentication and authorization
- Secure API with data validation
- Fast and responsive user interface
