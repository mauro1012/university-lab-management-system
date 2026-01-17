
# Resource Management Microservice

## Technical Overview

The Resource Management Microservice serves as the operational core of the university laboratory management system. Its primary mandate involves managing the lifecycle of physical assets (laboratories) and orchestrating their temporal availability through a robust assignment system.

The architecture is built upon principles of consistency and high availability, decoupling identity logic from resource management while ensuring atomic integration through the utilization of JWT tokens.

## Project Structure

The service follows a modular architecture designed for scalability and maintainability:

```text
resource-service/
├── prisma/
│   └── schema.prisma          # Database schema and ORM configuration
├── src/
│   ├── assignments/           # Scheduling logic and conflict validation
│   ├── laboratories/          # Physical infrastructure management
│   ├── common/                # Security guards, decorators, and global filters
│   ├── prisma/                # Prisma service and module integration
│   └── main.ts                # Application entry point
├── docker-compose.yml         # Containerized PostgreSQL configuration
└── .env                       # Environment variables and security secrets

```

## Technology Stack

* **Framework:** NestJS (Node.js) – Modular architecture providing a highly testable and scalable environment.
* **Language:** TypeScript – Implemented to ensure static typing and the mitigation of runtime exceptions.
* **ORM:** Prisma – Utilized as a data abstraction layer to guarantee schema integrity and controlled migrations.
* **Database:** PostgreSQL (Containerized) – Relational engine chosen for its capacity to handle complex relationships and transactional consistency.
* **Security:** Passport.js & JWT – Authentication framework for role validation and cross-service identity persistence.

## Architectural Decisions

* **Data Denormalization for Performance:** Upon assignment creation, the `teacherName` attribute is physically persisted within the resource database. This technique mitigates network latency by eliminating the requirement for synchronous queries to the Security Microservice during bulk read operations.
* **Conflict Validation Engine:** A temporal overlap validation logic has been implemented to prevent reservation collisions within the same space and time window, ensuring the integrity of the academic schedule.
* **Role-Based Access Control (RBAC):** * **ADMIN:** Granted exclusive write privileges (`CREATE`, `UPDATE`, `DELETE`) to centralize administrative governance.
* **TEACHER/PUBLIC:** Limited to read privileges (`READ`) for real-time availability visualization.



## Endpoint Definition

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/laboratories` | Registration of new physical infrastructure. | Admin |
| `POST` | `/assignments` | Creation of temporal assignments. | Admin |
| `GET` | `/assignments` | Real-time global availability inquiry. | Authenticated |
| `PATCH` | `/assignments/:id` | Partial modification of assignment records. | Admin |
| `DELETE` | `/assignments/:id` | Record deletion and resource release. | Admin |

---
