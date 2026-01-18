
# Security and Authentication Microservice

---

## 1. Overview

The **Security and Authentication Microservice** is the central identity provider of the **University Lab Management System**.
It is responsible for **user authentication**, **authorization**, and **access control**, implementing a **stateless security model** based on **JSON Web Tokens (JWT)** and **Role-Based Access Control (RBAC)**.

This service ensures secure access to all protected resources across the platform and acts as the foundation for inter-service communication and API protection.

---

## 2. Technology Stack

### Backend

* **Framework:** NestJS (Node.js runtime)
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Authentication:** Passport.js (JWT Strategy)
* **Security:**

  * Bcrypt (password hashing, 10 salt rounds)
  * JWT standardized payload (`sub` claim)
  * Regex-based input validation

### Frontend

* **Framework:** React (Vite)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **API Communication:** Axios with JWT interceptors

---

## 3. Project Structure

### Backend — Auth Service

```text
auth-service/
├── src/
│   ├── auth/
│   │   ├── decorators/        # Custom decorators (@Roles)
│   │   ├── dto/               # login.dto.ts, register.dto.ts
│   │   ├── guards/            # jwt-auth.guard.ts, roles.guard.ts
│   │   ├── strategies/        # jwt.strategy.ts (JWT sub mapping)
│   │   ├── auth.controller.ts # Login, register, change password
│   │   └── auth.service.ts    # Authentication logic
│   ├── users/
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
```

---

### Frontend — Web Application

```text
frontend-web/
├── src/
│   ├── pages/
│   │   ├── users/             # UserManagement.tsx (Admin CRUD)
│   │   ├── profile/           # Profile.tsx (Self-service security)
│   │   └── dashboard/         # Role-based dashboards
│   ├── api/
│   │   └── auth.api.ts        # Axios instance with JWT interceptor
```

---

## 4. Key Features

### Authentication & Authorization

* Stateless JWT-based authentication
* Role-based access control (RBAC)
* Secure token validation via Passport strategies

### Self-Service Security

* Profile management for Admins and Teachers
* Secure password change flow
* Bcrypt validation of previous password before updates

### Admin User Management

* Create, list, update, and delete users
* Role assignment without exposing passwords
* UI-level route protection and redirection

### JWT Standardization

* Uses `sub` (subject) to store the user ID
* Prevents undefined user resolution in protected routes
* Ensures compatibility across backend guards and strategies

---

## 5. Security Design Principles

* Stateless authentication using HTTP `Authorization: Bearer` headers

* Strict separation of authentication and authorization concerns

* Standardized JWT payload structure:

  ```json
  {
    "sub": "user-id",
    "email": "user@email.com",
    "role": "ADMIN"
  }
  ```

* Frontend route protection based on role permissions

* No sensitive credentials stored or exposed in client-side code

---

## 6. Database Design

### User Model

* UUID-based primary key
* Unique email index
* Hashed passwords
* Role-based authorization
* Audit fields for tracking creation and updates

### Role Enumeration

```text
ADMIN    - Full system access and user management
TEACHER  - Limited access to personal profile and labs
```

---

## 7. API Endpoints

### Authentication

| Method | Endpoint                | Access  | Description                      |
| ------ | ----------------------- | ------- | -------------------------------- |
| POST   | `/auth/login`           | Public  | Authenticate user and return JWT |
| POST   | `/auth/register`        | Admin   | Register new user                |
| POST   | `/auth/change-password` | Private | Update password after validation |

### User Management

| Method | Endpoint     | Access | Description      |
| ------ | ------------ | ------ | ---------------- |
| GET    | `/users`     | Admin  | List all users   |
| PATCH  | `/users/:id` | Admin  | Update user data |

---

## 8. Architectural Role

This microservice acts as:

* The **authentication authority** for all backend services
* The **JWT issuer** for protected endpoints
* The foundation for **secure microservice communication**

It is designed to integrate seamlessly with:

* API Gateway / ALB routing
* Docker-based deployments
* QA and Production environments
* CI/CD pipelines

---

## 9. Status

* Auth flows implemented and validated
* Role-based access enforced
* Database migrations stable
* Ready for containerization and AWS deployment

---

