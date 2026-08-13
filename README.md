# IOCL Consumables & Procurement Management System

An internal enterprise procurement and consumables management system for **Indian Oil Corporation Limited (IOCL)**.

---

## 📁 Repository Structure

```text
consumables-automation-project/
├── backend/                  # Java 21 & Spring Boot 3.4 REST API backend
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   ├── pom.xml               # Maven configuration
│   ├── .env.example          # Backend environment variables template
│   └── README.md             # Backend documentation & API guide
│
├── frontend/                 # React frontend (to be developed)
│   └── README.md             # Frontend documentation
│
├── .env.example              # Root environment variables template
├── .gitignore                # Git ignore rules for Java, React, and secrets
└── README.md                 # Project root documentation
```

---

## 🚀 Quick Start

### 1. Prerequisites
* **Java**: JDK 21 (LTS)
* **Maven**: Apache Maven 3.9+
* **Database**: PostgreSQL 16+
* **Node.js**: v18+ (for upcoming frontend)

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
3. Set your PostgreSQL credentials in `.env` or as shell environment variables.
4. Run Maven build and tests:
   ```bash
   mvn clean test
   ```
5. Start the Spring Boot backend application:
   ```bash
   mvn spring-boot:run
   ```

For detailed backend endpoints and architecture details, refer to the [Backend Documentation](backend/README.md).

### 3. Frontend Setup
The React frontend application will be developed inside the `frontend/` directory.

---

## 🔒 Security Best Practices
* **Never commit `.env` or sensitive credentials** to version control.
* `.env` and `target/` are explicitly ignored by `.gitignore`.
* Always use `.env.example` as a template for setting up new environments.
