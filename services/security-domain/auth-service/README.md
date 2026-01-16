# Security and Authentication Microservice

## 1. Overview

The Security and Authentication Microservice is a core component of the University Lab Management System.
Its responsibility is to manage user identity, authentication, and authorization, providing a secure and centralized access control mechanism for all other microservices.

The service implements a stateless security model based on JSON Web Tokens (JWT) and Role-Based Access Control (RBAC), ensuring scalability, maintainability, and compliance with modern security standards.

---

## 2. Technology Stack

* **Language:** TypeScript (Node.js runtime)
* **Framework:** NestJS (modular and scalable architecture)
* **Database:** PostgreSQL (Dockerized or Amazon RDS compatible)
* **ORM:** Prisma
* **Authentication:** JSON Web Tokens (JWT)
* **Security:**

  * Bcrypt for password hashing
  * Passport.js for JWT authentication strategy

---

## 3. Project Structure

```text
src/
├── auth/
│   ├── dto/
│   │   └── login.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── users/
│   ├── dto/
│   │   └── create-user.dto.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── app.module.ts
└── main.ts
```

---

## 4. Core Components

### UsersController

Exposes HTTP endpoints for user management operations.
It applies validation mechanisms to ensure input data integrity.

### UsersService

Encapsulates all user-related business logic and database interactions.
Uses Prisma Client to perform secure CRUD operations on PostgreSQL.

### AuthService

Handles authentication logic, including credential validation using Bcrypt and JWT token generation.

### JwtStrategy

Validates incoming JWT tokens and attaches authenticated user metadata to the request context.

### JwtAuthGuard and RolesGuard

* JwtAuthGuard protects routes by requiring a valid JWT.
* RolesGuard enforces Role-Based Access Control by verifying user permissions.

### Data Transfer Objects (DTOs)

* CreateUserDto
* LoginDto

DTOs define request schemas and apply validation rules using class-validator decorators.

---

## 5. Database Schema

The database schema is defined in `schema.prisma` and ensures relational consistency and scalability.

### User Model

* `id`: UUID (Primary Key)
* `email`: Unique and indexed
* `password`: Hashed value
* `role`: Enum-based role
* `createdAt`: Timestamp
* `updatedAt`: Timestamp

### Role Enum

Defines authorization levels within the system:

* ADMIN
* MANAGER
* STUDENT
* USER

---

## 6. Security Design Principles

* Passwords are securely hashed and never stored in plain text
* Stateless authentication using JWT
* Centralized authorization using RBAC
* Clear separation of concerns using NestJS modules

---

## 7. Role Within the System

This microservice serves as the authentication and authorization backbone of the platform, enabling secure communication between microservices and consistent enforcement of access control policies across the system.


