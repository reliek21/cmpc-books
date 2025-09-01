# CMPC Books - Digital Library Management System

## Project Description

**CMPC Books** is a complete digital library management system developed as a technical test. The project implements a modern full-stack architecture with the following features:

- 📚 **Book Management**: Complete CRUD with validations
- 👤 **User System**: JWT authentication and role management
- 📁 **File Upload**: Handling of related documents
- 🧪 **Complete Testing**: Unit test coverage for frontend and backend
- 🐳 **Containerization**: Deployment with Docker Compose

## System Architecture

### Technology Stack

**Frontend:**
- Next.js 15 with TypeScript
- React 19 with modern Hooks
- TanStack Query for state management
- Tailwind CSS + Radix UI for design
- React Hook Form + Zod for validations
- Jest + Testing Library for testing

**Backend:**
- NestJS with TypeScript
- Sequelize ORM + PostgreSQL
- JWT for authentication
- Swagger for API documentation
- Jest for unit testing
- Multer for file uploads

**DevOps:**
- Docker + Docker Compose
- pnpm + Turbo for monorepo
- ESLint + Prettier for code
- GitHub Actions ready

## Project Structure

```
cmcp-libros/
├── apps/
│   ├── server/           # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/         # JWT Authentication
│   │   │   │   ├── users/        # User management
│   │   │   │   ├── books/        # Book CRUD
│   │   │   │   └── upload/       # File uploads
│   │   │   ├── config/           # DB Configuration
│   │   │   └── common/           # Guards, interceptors
│   │   └── test/                 # E2E Tests
│   │
│   └── web/              # Next.js Frontend
│       ├── src/
│       │   ├── app/              # App Router
│       │   ├── components/       # UI Components
│       │   ├── hooks/            # Custom hooks
│       │   ├── lib/              # Utilities
│       │   └── types/            # TypeScript types
│       └── __tests__/            # Unit tests
│
├── docker-compose.yml    # Complete orchestration
├── .env                  # Global variables
└── README.md            # This file
```

## 🚀 Quick Start (One Command)

### Prerequisites

- [Docker](https://www.docker.com/get-started) & Docker Compose
- [pnpm](https://pnpm.io/installation) >= 9.0
- [Node.js](https://nodejs.org/) >= 18

### Automatic Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd cmcp-libros

# 2. Configure environment variables
cp .env.example .env
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Install dependencies
pnpm install

# 4. 🎯 LAUNCH ENTIRE PROJECT
docker-compose up --build
```

### Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api
- **PostgreSQL**: localhost:5432

## Environment Variables

### `.env` (Project root)

```env
# PostgreSQL Database
POSTGRES_USER=cmpc123
POSTGRES_PASSWORD=postgrescmpc
POSTGRES_DB=cmpc

# Docker Network
COMPOSE_PROJECT_NAME=cmcp-libros
```

### `apps/server/.env` (Backend)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=cmpc123
DATABASE_PASSWORD=postgrescmpc
DATABASE_NAME=cmpc

# JWT
JWT_SECRET=super-secret-jwt-key-for-cmpc-books-2024
JWT_EXPIRES=7d

# Files
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:3000
```

### `apps/web/.env.local` (Frontend)

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
BASE_API_URL=http://localhost:3001

# Next.js Configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=CMPC Books

# Feature flags
NEXT_PUBLIC_ENABLE_UPLOAD=true
NEXT_PUBLIC_ENABLE_EXPORT=true
```

## 🔧 Development Commands

### Local Development (Without Docker)

```bash
# Terminal 1: Database
docker-compose up db

# Terminal 2: Backend
cd apps/server
pnpm dev

# Terminal 3: Frontend
cd apps/web
pnpm dev
```

### Available Scripts

```bash
# Monorepo (from root)
pnpm dev          # Parallel development
pnpm build        # Production build
pnpm test         # Complete tests
pnpm lint         # Linting
pnpm clean        # Clean builds

# Backend specific
cd apps/server
pnpm test:cov     # Tests with coverage
pnpm test:e2e     # E2E Tests
pnpm start:prod   # Production

# Frontend specific
cd apps/web
pnpm test:watch   # Tests in watch mode
pnpm build        # Static build
pnpm start        # Production server
```

## 🧪 Testing

### Current Coverage

<img width="1003" height="807" alt="Screenshot 2025-09-01 at 9 23 33 AM" src="https://github.com/user-attachments/assets/73bcd9cd-370e-41e4-be54-c0760b91baba" />

**Backend**: 82.4%
**Frontend**: 87.5%

### Run Tests

```bash
# All tests
pnpm test

# Specific tests
cd apps/server && pnpm test:cov
cd apps/web && pnpm test:coverage

# Tests in watch mode
pnpm test:watch
```

## 📋 Implemented Features

### ✅ Authentication and Users

- [x] User registration with validation
- [x] JWT login
- [x] Authentication middleware
- [x] Password hashing with bcrypt
- [x] Route protection

### ✅ Book Management

- [x] Complete CRUD (Create, Read, Update, Delete)
- [x] Filters and searches
- [x] Input validations
- [x] Pagination
- [x] Sorting

### ✅ File System

- [x] File uploads
- [x] MIME type validation
- [x] Size limits
- [x] Organized storage

### ✅ Modern Frontend

- [x] Responsive interface
- [x] Forms with validation
- [x] Global state with TanStack Query
- [x] Reusable components
- [x] Loading states and error handling

## 🔒 Security Implemented

- **JWT Authentication**: Secure tokens with expiration
- **Password Hashing**: bcrypt with salt
- **Input Validation**: Zod schemas + class-validator
- **CORS Configuration**: Specific origin
- **File Upload Security**: Type and size validation
- **Environment Variables**: Secret separation

## 🐳 Docker Configuration

### Defined Services

1. **PostgreSQL**: Database with persistence
2. **Backend**: NestJS API with hot-reload
3. **Frontend**: Optimized Next.js app
4. **Volumes**: Data and uploads persistence

### Docker Commands

```bash
# Build and run
docker-compose up --build

# Database only
docker-compose up db

# Specific logs
docker-compose logs backend
docker-compose logs frontend

# Clean containers
docker-compose down -v
```

## � Database Schema

### ER Diagram

The database schema includes the following main entities:

- **Users**: User management with authentication
- **Books**: Book catalog with user relationships
- **Uploads**: File management system

For detailed schema information, visit: [CMPC Books Database Diagram](https://dbdiagram.io/d/CMPC-Books-68afd837777b52b76ce76658)

## 📚 API Documentation

### Swagger UI
Access the interactive documentation at: http://localhost:3001/api

### Main Endpoints

```
# Authentication
POST /auth/login
POST /auth/register

# Users
GET    /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id

# Books
GET    /books
POST   /books
GET    /books/:id
PUT    /books/:id
DELETE /books/:id

# Files
POST   /upload
GET    /upload/:filename
```

## 🚨 Troubleshooting

### Common Issues

**Port in use:**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:5432 | xargs kill -9
```

**pnpm issues:**
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

**Database:**
```bash
docker-compose down -v
docker-compose up db
```

**Docker cache:**
```bash
docker system prune -a
docker-compose build --no-cache
```

### Logs and Debugging

```bash
# Real-time logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Connect to container
docker-compose exec backend sh
docker-compose exec db psql -U cmpc123 -d cmpc
```

## 🎯 Next Steps

### Suggested Improvements

- [ ] **E2E Testing**: Cypress or Playwright
- [ ] **CI/CD**: Complete GitHub Actions
- [ ] **Monitoring**: Structured logs
- [ ] **Performance**: Redis cache
- [ ] **Security**: Rate limiting
- [ ] **UI/UX**: More Radix components
- [ ] **PWA**: Service workers
- [ ] **Analytics**: Event tracking

### Optimizations

- [ ] **Database**: Optimized indexes and queries
- [ ] **Frontend**: Automatic code splitting
- [ ] **Backend**: Gzip compression
- [ ] **Images**: Automatic optimization
- [ ] **Bundle**: Advanced tree shaking

## 👥 Team Development

### Git Workflow

```bash
# Recommended branches
git checkout -b feature/new-functionality
git checkout -b fix/bug-fix
git checkout -b docs/readme-update
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Extended configuration
- **Prettier**: Automatic formatting
- **Commits**: Conventional commits

## 📄 License

This project is a technical test for full-stack development evaluation.

**Developed with ❤️ for CMPC**

---

*For more technical information, check the specific READMEs in `apps/server/` and `apps/web/`*
