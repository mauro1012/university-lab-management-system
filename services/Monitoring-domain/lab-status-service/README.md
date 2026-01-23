# 🛰️ Lab Status Service (Monitoring Domain)

This microservice is a critical component responsible for managing and exposing the real-time status of laboratories and user sessions. It utilizes a **low-latency** architecture designed to handle multiple simultaneous "Check-in" and "Check-out" requests.

## Main Function

Its purpose is to serve as an ultra-fast, volatile persistence layer. It enables the Administration Dashboard to visualize which labs are currently occupied in real-time, eliminating the need for heavy queries to the main relational database (PostgreSQL).

---

## Tech Stack

* **Language:** [Go (Golang) 1.21](https://go.dev/) – Chosen for its efficient memory management and high concurrency handling.
* **Database:** [Redis 7 (Alpine)](https://redis.io/) – In-memory data store for low-latency access.
* **API:** REST using the **Gin** framework (or Go standard library).
* **Containers:** Docker (Multi-stage builds) and Docker Compose.
* **Infrastructure:** Deployed on **AWS** via **Terraform**.

---

## Data Flow

The service operates independently from other domains (Auth and Resource), ensuring high availability even if the central database experiences latency:

1. **Ingress:** The Frontend (React/Vercel) consumes the API through port **8081** of the Application Load Balancer (ALB).
2. **Processing:** The Go service validates the action and communicates with Redis within an isolated private network.
3. **State:** Data is stored in Redis using temporary keys (TTL) to ensure that the state is automatically cleared once sessions end.

---

## Microservice Structure

The service follows a clean directory structure within the monorepo:

```text
/services/Monitoring-domain/lab-status-service/
├── cmd/
│   └── server/
│       └── main.go       # Entry point and server configuration
├── internal/             # Private business logic
│   ├── handlers/         # Route handlers (HTTP)
│   └── repository/       # Redis connection abstraction
├── Dockerfile            # Multi-stage configuration for AWS
├── go.mod                # Module definition and dependencies
└── go.sum                # Dependency checksums

```

---

## Deployment and Orchestration

### Local Development

From the **project root**, the service is orchestrated via the global `docker-compose.yml`, which locates the internal `Dockerfile` using the build context:

```bash
docker-compose up --build lab-status-service

```

### Production/QA (AWS)

Deployment is fully automated with **Terraform**:

* **Cloud Docker Compose:** Terraform generates a dynamic Compose file on the EC2 instance to spin up **Go** and **Redis** as an atomic unit.
* **Security:** Redis is not exposed to the ALB; it is only accessible by the Go microservice through an internal Docker network, minimizing the attack surface.

---

## Key Endpoints

* `GET /health`: Verifies service health and Redis connection.
* `GET /api/v1/status`: Retrieves the current map of active laboratories.
* `POST /api/v1/checkin`: Registers the start of a new session.
