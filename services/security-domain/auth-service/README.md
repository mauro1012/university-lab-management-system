Security and Authentication Microservice

1. Description
This microservice manages identity, user registration, and access control for the University Lab Management System. It implements a robust security model based on JSON Web Tokens (JWT) and Role-Based Access Control (RBAC).

2. Technical Stack
Language: TypeScript (Node.js runtime).

Framework: NestJS using a modular architecture.

Database: PostgreSQL (Amazon RDS or Dockerized).

ORM: Prisma.

Security: Bcrypt for password hashing and Passport.js for JWT strategy.

3. Core Classes and Components
UsersController: Manages HTTP endpoints for user management. It utilizes ValidationPipes to ensure data integrity.

UsersService: Encapsulates business logic and persistence. It interacts with the Prisma Client to perform CRUD operations on PostgreSQL.

AuthService: Handles credential verification (Bcrypt comparison) and JWT generation.

JwtStrategy: Validates tokens in incoming requests and attaches user metadata to the request object.

RolesGuard: A functional guard that intercepts requests to verify if the authenticated user's role matches the required permissions for the route.

CreateUserDto / LoginDto: Classes defining data transfer schemas with validation decorators from class-validator.

4. Database Schema
Defined in schema.prisma, the model ensures relational consistency:

User Model: Contains id (UUID), email (Unique index), password (Hashed), and role (Enum).

Role Enum: Levels include ADMIN, TEACHER, STUDENT, and USER.