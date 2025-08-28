# CMPC Books – Technical Test Documentation

## Overview

**CMPC Books** is a technical test project for a digital library system. It consists of a monorepo with two main applications:
- **Backend**: Built with NestJS, provides API and business logic.
- **Frontend**: Built with Next.js, offers a modern web interface for users.

The project uses PostgreSQL as its database and Docker for local development orchestration.

---

## Project Structure

```
cmcp-libros/
│
├── apps/
│   ├── backend/      # NestJS API server
│   └── frontend/     # Next.js (React) web client
│
├── docker-compose.yml
├── package.json      # Monorepo root, uses pnpm and turbo
├── pnpm-workspace.yaml
├── turbo.json        # Turbo pipeline config
└── README.md
```

### Backend (`apps/backend`)
- **NestJS** application.
- Contains API controllers, services, and modules.
- Uses environment variables from `.env`.
- Connects to PostgreSQL.

### Frontend (`apps/frontend`)
- **Next.js** application.
- Contains pages, global styles, and assets.
- Uses environment variables from `.env.local`.

---

## How to Launch Locally

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [pnpm](https://pnpm.io/installation)
- [Node.js](https://nodejs.org/) (recommended v18+)

### 1. Clone the Repository

```sh
git clone <repo-url>
cd cmcp-libros
```

### 2. Install Dependencies

```sh
pnpm install
```

### 3. Environment Variables

- Copy and fill in the example env files:
	- Backend: `apps/backend/.env.example` → `apps/backend/.env`
	- Frontend: `apps/frontend/.env.example` → `apps/frontend/.env.local`
- Ensure database credentials match those in `docker-compose.yml` (default: user `postgres`, password `postgres`, db `cmpc`).

### 4. Start All Services (Recommended)

Use Docker Compose to launch the database, backend, and frontend together:

```sh
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Database**: localhost:5432 (PostgreSQL)

### 5. Development Scripts

You can also run apps individually for development:

#### Backend

```sh
cd apps/backend
pnpm dev
```

#### Frontend

```sh
cd apps/frontend
pnpm dev
```

#### Monorepo Scripts

From the root, you can use:

- `pnpm dev` – Runs both apps in parallel (via turbo)
- `pnpm build` – Builds both apps
- `pnpm lint` – Lints both apps
- `pnpm test` – Runs tests for both apps

---

## Explanation of Technologies

- **NestJS**: Scalable Node.js framework for building efficient server-side applications.
- **Next.js**: React-based framework for server-rendered web apps.
- **PostgreSQL**: Reliable open-source relational database.
- **Docker**: Containerization for consistent local development.
- **pnpm**: Fast, disk-efficient package manager.
- **Turbo**: Monorepo build system for running scripts in parallel.

---

## Notes

- This project is a technical test and may not be production-ready.
- The backend and frontend are decoupled but communicate via REST APIs.
- The database is persistent via Docker volumes (`db_data`).

---

## Troubleshooting

- If you encounter issues, ensure Docker is running and ports 3000, 3001, and 5432 are free.
- Check `.env` files for correct configuration.
- Use `pnpm install` if dependencies are missing.

---

## License

This project is for technical evaluation purposes.

---
