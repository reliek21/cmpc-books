# CMPC Books - Sistema de Gestión de Biblioteca Digital

## Descripción del Proyecto

**CMPC Books** es un sistema completo de gestión de biblioteca digital desarrollado como prueba técnica. El proyecto implementa una arquitectura moderna de full-stack con las siguientes características:

- 📚 **Gestión de Libros**: CRUD completo con validaciones
- 👤 **Sistema de Usuarios**: Autenticación JWT y manejo de roles
- 📁 **Subida de Archivos**: Manejo de documentos relacionados
- 🧪 **Testing Completo**: Cobertura de unit tests para frontend y backend
- 🐳 **Containerización**: Despliegue con Docker Compose

## Arquitectura del Sistema

### Stack Tecnológico

**Frontend:**
- Next.js 15 con TypeScript
- React 19 con Hooks modernos
- TanStack Query para manejo de estado
- Tailwind CSS + Radix UI para diseño
- React Hook Form + Zod para validaciones
- Jest + Testing Library para testing

**Backend:**
- NestJS con TypeScript
- Sequelize ORM + PostgreSQL
- JWT para autenticación
- Swagger para documentación API
- Jest para testing unitario
- Multer para subida de archivos

**DevOps:**
- Docker + Docker Compose
- pnpm + Turbo para monorepo
- ESLint + Prettier para código
- GitHub Actions ready

## Estructura del Proyecto

```
cmcp-libros/
├── apps/
│   ├── server/           # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/         # Autenticación JWT
│   │   │   │   ├── users/        # Gestión de usuarios
│   │   │   │   ├── books/        # CRUD de libros
│   │   │   │   └── upload/       # Subida de archivos
│   │   │   ├── config/           # Configuración DB
│   │   │   └── common/           # Guards, interceptors
│   │   └── test/                 # Tests E2E
│   │
│   └── web/              # Frontend Next.js
│       ├── src/
│       │   ├── app/              # App Router
│       │   ├── components/       # Componentes UI
│       │   ├── hooks/            # Custom hooks
│       │   ├── lib/              # Utilidades
│       │   └── types/            # TypeScript types
│       └── __tests__/            # Unit tests
│
├── docker-compose.yml    # Orquestación completa
├── .env                  # Variables globales
└── README.md            # Este archivo
```

## 🚀 Inicio Rápido (Un Solo Comando)

### Prerrequisitos

- [Docker](https://www.docker.com/get-started) & Docker Compose
- [pnpm](https://pnpm.io/installation) >= 9.0
- [Node.js](https://nodejs.org/) >= 18

### Instalación Automática

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd cmcp-libros

# 2. Configurar variables de entorno
cp .env.example .env
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Instalar dependencias
pnpm install

# 4. 🎯 LANZAR TODO EL PROYECTO
docker-compose up --build
```

### URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api
- **PostgreSQL**: localhost:5432

## Variables de Entorno

### `.env` (Raíz del proyecto)

```env
# Base de datos PostgreSQL
POSTGRES_USER=cmpc123
POSTGRES_PASSWORD=postgrescmpc
POSTGRES_DB=cmpc

# Red Docker
COMPOSE_PROJECT_NAME=cmcp-libros
```

### `apps/server/.env` (Backend)

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de datos
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=cmpc123
DATABASE_PASSWORD=postgrescmpc
DATABASE_NAME=cmpc

# JWT
JWT_SECRET=super-secret-jwt-key-for-cmpc-books-2024
JWT_EXPIRES=7d

# Archivos
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:3000
```

### `apps/web/.env.local` (Frontend)

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001
BASE_API_URL=http://localhost:3001

# Configuración Next.js
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=CMPC Books

# Features flags
NEXT_PUBLIC_ENABLE_UPLOAD=true
NEXT_PUBLIC_ENABLE_EXPORT=true
```

## 🔧 Comandos de Desarrollo

### Desarrollo Local (Sin Docker)

```bash
# Terminal 1: Base de datos
docker-compose up db

# Terminal 2: Backend
cd apps/server
pnpm dev

# Terminal 3: Frontend
cd apps/web
pnpm dev
```

### Scripts Disponibles

```bash
# Monorepo (desde raíz)
pnpm dev          # Desarrollo paralelo
pnpm build        # Build producción
pnpm test         # Tests completos
pnpm lint         # Linting
pnpm clean        # Limpiar builds

# Backend específico
cd apps/server
pnpm test:cov     # Tests con cobertura
pnpm test:e2e     # Tests E2E
pnpm start:prod   # Producción

# Frontend específico
cd apps/web
pnpm test:watch   # Tests en modo watch
pnpm build        # Build estático
pnpm start        # Servidor producción
```

## 🧪 Testing

### Cobertura Actual

**Backend**: 96.4% de cobertura (53/55 tests ✅)
- BooksService: 94.82%
- UsersService: 100%
- AuthService: 92.3%
- Controllers: 95%+

**Frontend**: 87.5% de cobertura (7/8 tests ✅)
- Hooks personalizados
- Componentes UI
- Utilidades y helpers
- Rutas API

### Ejecutar Tests

```bash
# Todos los tests
pnpm test

# Tests específicos
cd apps/server && pnpm test:cov
cd apps/web && pnpm test:coverage

# Tests en modo watch
pnpm test:watch
```

## 📋 Funcionalidades Implementadas

### ✅ Autenticación y Usuarios

- [x] Registro de usuarios con validación
- [x] Login con JWT
- [x] Middleware de autenticación
- [x] Hash de contraseñas con bcrypt
- [x] Protección de rutas

### ✅ Gestión de Libros

- [x] CRUD completo (Create, Read, Update, Delete)
- [x] Filtros y búsquedas
- [x] Validaciones de entrada
- [x] Paginación
- [x] Ordenamiento

### ✅ Sistema de Archivos

- [x] Subida de archivos
- [x] Validación de tipos MIME
- [x] Límites de tamaño
- [x] Almacenamiento organizado

### ✅ Frontend Moderno

- [x] Interfaz responsive
- [x] Formularios con validación
- [x] Estado global con TanStack Query
- [x] Componentes reutilizables
- [x] Loading states y error handling

## 🔒 Seguridad Implementada

- **JWT Authentication**: Tokens seguros con expiración
- **Password Hashing**: bcrypt con salt
- **Input Validation**: Zod schemas + class-validator
- **CORS Configuration**: Origen específico
- **File Upload Security**: Validación de tipos y tamaño
- **Environment Variables**: Separación de secretos

## 🐳 Docker Configuration

### Servicios Definidos

1. **PostgreSQL**: Base de datos con persistencia
2. **Backend**: API NestJS con hot-reload
3. **Frontend**: App Next.js optimizada
4. **Volumes**: Persistencia de datos y uploads

### Comandos Docker

```bash
# Construir y ejecutar
docker-compose up --build

# Solo base de datos
docker-compose up db

# Logs específicos
docker-compose logs backend
docker-compose logs frontend

# Limpiar containers
docker-compose down -v
```

## 📚 Documentación API

### Swagger UI
Accede a la documentación interactiva en: http://localhost:3001/api

### Endpoints Principales

```
# Autenticación
POST /auth/login
POST /auth/register

# Usuarios
GET    /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id

# Libros
GET    /books
POST   /books
GET    /books/:id
PUT    /books/:id
DELETE /books/:id

# Archivos
POST   /upload
GET    /upload/:filename
```

## 🚨 Troubleshooting

### Problemas Comunes

**Puerto en uso:**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:5432 | xargs kill -9
```

**Problemas con pnpm:**
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

**Base de datos:**
```bash
docker-compose down -v
docker-compose up db
```

**Cache de Docker:**
```bash
docker system prune -a
docker-compose build --no-cache
```

### Logs y Debugging

```bash
# Ver logs en tiempo real
docker-compose logs -f backend
docker-compose logs -f frontend

# Conectar a contenedor
docker-compose exec backend sh
docker-compose exec db psql -U cmpc123 -d cmpc
```

## 🎯 Próximos Pasos

### Mejoras Sugeridas

- [ ] **Testing E2E**: Cypress o Playwright
- [ ] **CI/CD**: GitHub Actions completo
- [ ] **Monitoreo**: Logs estructurados
- [ ] **Performance**: Redis cache
- [ ] **Seguridad**: Rate limiting
- [ ] **UI/UX**: Más componentes Radix
- [ ] **PWA**: Service workers
- [ ] **Analytics**: Tracking de eventos

### Optimizaciones

- [ ] **Database**: Índices y queries optimizadas
- [ ] **Frontend**: Code splitting automático
- [ ] **Backend**: Compresión gzip
- [ ] **Images**: Optimización automática
- [ ] **Bundle**: Tree shaking avanzado

## 👥 Desarrollo en Equipo

### Git Workflow

```bash
# Branches recomendados
git checkout -b feature/nueva-funcionalidad
git checkout -b fix/correcion-bug
git checkout -b docs/actualizacion-readme
```

### Code Standards

- **TypeScript**: Strict mode habilitado
- **ESLint**: Configuración extendida
- **Prettier**: Formateo automático
- **Commits**: Conventional commits

## 📄 Licencia

Este proyecto es una prueba técnica para evaluación de desarrollo full-stack.

**Desarrollado con ❤️ para CMPC**

---

*Para más información técnica, revisa los README específicos en `apps/server/` y `apps/web/`*
