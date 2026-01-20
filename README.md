cd# AWS Lab Management Microservices Architecture 

##  Project Description
This project focuses on a real-time university laboratory availability monitoring and management system. It utilizes a highly scalable microservices architecture deployed on **AWS**, designed to handle high student concurrency while ensuring academic data integrity through polyglot persistence. The system provides automated tracking of lab spaces, allowing students to check availability and teachers to manage sessions seamlessly.

---

##  Tech Stack

### Languages & Frameworks
* **Backend:** Node.js / Python (Specialized microservices).
* **Frontend:** Next.js (Dashboard for teachers and availability view for students).
* **Infrastructure:** Terraform (Infrastructure as Code).

### Databases (Polyglot Persistence)
* **Amazon RDS (PostgreSQL):** Master data, schedules, and academic records.
* **Amazon DynamoDB:** High-speed session history and occupancy states.
* **Amazon ElastiCache (Redis):** In-memory cache for real-time availability.

---

##  Architecture & Infrastructure
The architecture follows **Distributed Systems** and **Fault Tolerance** principles. It consists of 10 independent microservices communicating synchronously via REST and asynchronously via events.

* **Networking:** Deployed within a Virtual Private Cloud (VPC) in the **US East (Chicago)** region.
* **Compute:** Utilizes **t3.medium** EC2 instances within an Auto Scaling Group (ASG) for consistent performance.
* **Load Balancing:** Implementation of two **Application Load Balancers (ALB)** to distribute traffic efficiently across microservices.
* **Storage:** Configured with three **30 GB EBS volumes** (90 GB total) for logs and persistent data.
* **Security:** A single **In-use public IPv4 address** serves as a controlled entry point, with critical services isolated in private subnets.

---

##  DevOps & CI/CD
* **Containerization:** All services are containerized using **Docker** to ensure environment consistency.
* **Automation:** **Terraform** is used to manage and provision the AWS infrastructure.
* **Savings Strategy:** Implements a **Compute Savings Plan (1yr)** to optimize compute costs.

---

##  Cost Estimation (Monthly)
Based on the AWS Pricing Calculator:
* **Total