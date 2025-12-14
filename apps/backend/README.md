# DICOM Medical Imaging System - Backend

A robust, scalable microservices backend for medical imaging management built with NestJS, TypeORM, and PostgreSQL.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Microservices](#microservices)
- [Shared Libraries](#shared-libraries)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [Docker Deployment](#docker-deployment)
- [API Documentation](#api-documentation)

## 🎯 Overview

This backend provides a comprehensive set of microservices for the DICOM Medical Imaging System, handling authentication, patient management, imaging workflows, and real-time communication.

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | NestJS 11 |
| **Language** | TypeScript 5.8 |
| **Database** | PostgreSQL + TypeORM |
| **Caching** | Redis + ioredis |
| **Authentication** | JWT |
| **File Storage** | Cloudinary |
| **Real-time** | Socket.IO |
| **Build System** | Nx Monorepo |
| **API Docs** | Swagger/OpenAPI |
| **Testing** | Jest |
| **DICOM Parsing** | dcmjs, dicom-parser |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (5000)                     │
│              Route requests, aggregate responses            │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  User Service   │  │ Patient Service │  │ Imaging Service │
│     (5002)      │  │     (5004)      │  │     (5003)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ System Service  │
                    │     (5005)      │
                    └─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    WebSocket Gateway (5006)                  │
│                Real-time notifications & events              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Redis 6+
- Docker (optional, for containerized deployment)

### Installation

```bash
# Navigate to backend directory
cd apps/backend

# Install dependencies
npm install

# Set up environment files for each service
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/user-service/.env.example apps/user-service/.env
cp apps/patient-service/.env.example apps/patient-service/.env
cp apps/imaging-service/.env.example apps/imaging-service/.env
cp apps/system-service/.env.example apps/system-service/.env
cp apps/ws-gateway/.env.example apps/ws-gateway/.env

# Start all services in development mode
npm run dev
```

## 🔧 Microservices

| Service | Port | Description |
|---------|------|-------------|
| **api-gateway** | 5000 | Main entry point, routes requests, JWT validation |
| **user-service** | 5002 | Authentication, user management, roles, departments |
| **imaging-service** | 5003 | DICOM studies, series, instances, imaging orders |
| **patient-service** | 5004 | Patient records, encounters, medical history |
| **system-service** | 5005 | System config, notifications, AI analysis |
| **ws-gateway** | 5006 | WebSocket server for real-time communication |

### Service Communication

Services communicate via NestJS Microservices (TCP transport):
- API Gateway → All services (HTTP to TCP)
- Services → WebSocket Gateway (event broadcasting)
- All services use Redis for caching and session management

## 📚 Shared Libraries

Located in `libs/` directory:

| Library | Description |
|---------|-------------|
| **database** | TypeORM configuration, database connection |
| **redis** | Redis client configuration |
| **shared-client** | Microservice client utilities |
| **shared-decorators** | Custom NestJS decorators |
| **shared-domain** | Entity definitions and DTOs |
| **shared-enums** | Shared enumerations |
| **shared-exception** | Custom exception classes and filters |
| **shared-guards** | Authentication and authorization guards |
| **shared-interceptor** | Request/response interceptors |
| **shared-interfaces** | Shared TypeScript interfaces |
| **shared-utils** | Utility functions and helpers |

## ⚙️ Environment Configuration

Each service requires its own `.env` file. Common variables:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=dicom_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600

# Service Ports (varies by service)
PORT=5000  # api-gateway
PORT=5002  # user-service
PORT=5003  # imaging-service
PORT=5004  # patient-service
PORT=5005  # system-service
PORT=5006  # ws-gateway

# Cloudinary (for file storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📜 Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in development mode |
| `npm run start:dev` | Same as above |
| `npx nx serve <service>` | Start a specific service |
| `npx nx build <service>` | Build a specific service |
| `npx nx graph` | Visualize project dependency graph |

### Docker Commands

| Command | Description |
|---------|-------------|
| `npm run docker:build:local` | Build all Docker images (local tag) |
| `npm run docker:build:latest` | Build all Docker images (latest tag) |
| `npm run docker:up:local` | Start all containers (local tag) |
| `npm run docker:up:latest` | Start all containers (latest tag) |
| `npm run docker:up:local:build` | Build and start containers |
| `npm run docker:down` | Stop all containers |
| `npm run docker:logs` | View all container logs |
| `npm run docker:logs:api` | View API Gateway logs |
| `npm run docker:logs:user` | View User Service logs |
| `npm run docker:logs:patient` | View Patient Service logs |
| `npm run docker:logs:imaging` | View Imaging Service logs |
| `npm run docker:logs:system` | View System Service logs |
| `npm run docker:ps` | List running containers |
| `npm run docker:restart` | Restart all containers |

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
npm run docker:up:local:build

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Individual Service Images

```bash
# Build specific service
npm run build-docker:local:api-gateway

# Run specific service
npm run run-docker:local:api-gateway
```

### Docker Compose Configuration

The `docker-compose.yml` includes:
- All 6 microservices
- PostgreSQL database
- Redis cache
- Network configuration
- Volume mounts for persistence

## 📖 API Documentation

When the API Gateway is running, access Swagger documentation at:

**http://localhost:5000/api**

### Main API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /auth/login` | User authentication |
| `GET /users` | User management |
| `GET /patients` | Patient records |
| `GET /studies` | DICOM studies |
| `GET /imaging-orders` | Imaging order management |
| `GET /reports` | Diagnostic reports |
| `GET /departments` | Department management |
| `GET /modalities` | Imaging modality configuration |

## 🧪 Testing

```bash
# Run all tests
npx nx run-many -t test

# Run tests for specific service
npx nx test api-gateway

# Run e2e tests
npx nx e2e api-gateway-e2e
```

## 🔗 Related Documentation

- [Root Project README](../../README.md) - System overview and architecture
- [Frontend README](../frontend/README.md) - Frontend application documentation
- [Nx Documentation](https://nx.dev) - Build system documentation

---

**Note**: Ensure PostgreSQL and Redis are running before starting the services.
