# IOCL Consumables & Procurement Management System

> **A full-stack enterprise web application for managing consumables procurement, rate contracts, call-up purchase orders, store inventory availability, asset usage tracking, employee master records, threshold-based procurement alerts, and operational reporting with automated Excel/CSV export.**

---

## 📌 Overview

The **IOCL Consumables & Procurement Management System** is a robust, production-grade enterprise platform engineered for **Indian Oil Corporation Limited (IOCL)**. It digitizes and streamlines the complete operational lifecycle of IT consumables (such as toner cartridges, imaging drums, and printer supplies)—from supplier Rate Contracts and Call-Up Purchase Orders to store stock inventory, engineer asset usage logging, automated beneficiary email receipts, and multi-tier tendering alerts.

The system enforces strict **Role-Based Access Control (RBAC)** across two dedicated portals:
1. **Admin Portal**: Comprehensive procurement administration, rate contract lifecycle management, multi-contract tracking, store inventory oversight, employee master registry, asset/printer configuration, alert threshold calibration, and multi-domain Excel/CSV reporting.
2. **User / Engineer Portal**: Streamlined portal for field service engineers to record consumable consumption against specific employees and cabins, query personal transaction histories, verify store availability in real-time, and trigger automatic email notifications to beneficiaries.

---

## 🎯 Objectives

- **Centralize Procurement Tracking**: Maintain an authoritative register of Rate Contracts, Call-Up Purchase Orders (Work Orders), unit costs, tax rates, and chronological transaction balances.
- **Support Multiple Rate Contracts**: Allow multiple active Rate Contracts for the same cartridge/part number without data collisions, maintaining individual contract balances alongside combined store-level availability.
- **Automate Stock Deduction & Integrity**: Connect Call-Up PO creation directly to store stock increment, and asset usage submission directly to store stock deduction under strict database locking.
- **Prevent Consumable Stockouts**: Automatically evaluate stock levels against two distinct threshold criteria:
  - **PO Threshold Alert**: Notifies administrators when Rate Contract availability is running low.
  - **URGENT Tendering Required Alert**: Warns when combined store inventory and rate contract availability fall below safety levels.
- **Improve Auditability**: Record both the **Recording Engineer** (derived securely from JWT) and the **Beneficiary Employee** (with department, seat/cabin, and location) for every usage event.
- **Provide Actionable Reporting**: Enable one-click generation and download of formatted Excel (`.xlsx`) workbooks and CSV files across all operational domains.

---

## ✨ Key Features

- 🔐 **Dual-Role Authentication**: Secure stateless JWT authentication with separate workflows for Administrators (`ROLE_ADMIN`) and Engineers (`ROLE_USER`).
- 📋 **Procurement Register & Full View**: Full lifecycle tracking of Rate Contracts with running balance history, supplier details, tax percentages, and search/filtering.
- 📦 **Automated Store Inventory Management**: Real-time store stock level tracking updated atomically via Call-Up PO intake and Asset Usage consumption.
- 🧮 **Accurate Multi-Contract Math**: Independent accounting for multiple Rate Contracts linked to a single part number.
- 🚨 **Dual-Level Threshold & Tendering Alerts**: Real-time evaluation of PO thresholds and combined tendering thresholds with visual badges and unread tracking.
- 📧 **Automated Multi-Channel Email System**:
  - Immediate HTML/Plain-text alert emails to Administrators upon threshold breach.
  - Urgent red-banner tendering requirement notifications for critical shortages.
  - Automated HTML receipt emails sent directly to beneficiary employees upon consumable issuance.
  - Consolidated Daily PO Threshold Report email scheduled every day at 6:00 PM IST.
- 👥 **Canonical Employee Master**: Comprehensive employee directory maintaining employee IDs, designations, departments, cabin/seat locations, assigned printers, and active status.
- 🖨️ **Asset & Printer Catalog**: Dynamic asset registry mapping printer models, serial numbers, departments, printer types (B&W / Color), and toner cartridge colors.
- 📊 **Multi-Domain Reporting & Export Engine**: High-performance reports for Asset Usage, Store Inventory, Procurement, Call-Up POs, Employees, and Stock Movement with native Excel (`.xlsx`) via Apache POI and CSV export.

---

## 🏗️ System Architecture

The application follows a modern, decoupled client-server architecture utilizing **Spring Boot** on the backend, **React with Vite** on the frontend, and **PostgreSQL** as the relational database engine.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Client Layer (Browser)                          │
├───────────────────────────────────┬────────────────────────────────────┤
│           Admin Portal            │        User / Engineer Portal      │
│  (Procurement, Alerts, Employees, │  (Usage Logging, History, Profile, │
│   Assets, Reports, Full View)     │   Assigned POs, Store Availability)│
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  │  HTTP / HTTPS REST API (JSON)      │
                  │  Authorization: Bearer <JWT_TOKEN> │
                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Spring Boot 3.4 Backend Application                  │
├────────────────────────────────────────────────────────────────────────┤
│ Security & Filters:                                                    │
│  ├── SecurityFilterChain (CORS, CSRF Disabled, Stateless Session)     │
│  ├── JwtAuthenticationFilter (Extracts & Validates Claims)             │
│  └── DaoAuthenticationProvider (BCryptPasswordEncoder)                 │
├────────────────────────────────────────────────────────────────────────┤
│ Controller Layer (REST Endpoints):                                     │
│  ├── AuthController (/api/auth)                                        │
│  ├── ProcurementController (/api/procurement)                          │
│  ├── AssetUsageController (/api/user/asset-usage)                      │
│  ├── AdminAssetUsageController (/api/admin/asset-usage)                │
│  ├── AdminEmployeeController (/api/admin/employees)                    │
│  ├── AdminReportController (/api/admin/reports)                        │
│  ├── AlertController (/api/alerts)                                     │
│  ├── AssetController (/api/assets)                                     │
│  ├── ThresholdController (/api/thresholds)                             │
│  ├── FullViewController (/api/procurement/full-view)                   │
│  └── UserDashboardController (/api/user/dashboard)                     │
├────────────────────────────────────────────────────────────────────────┤
│ Service & Business Logic Layer:                                        │
│  ├── RateContractService & CallUpPOService (Pessimistic Locking)       │
│  ├── AlertEvaluationService (Real-time PO & Tendering Math)            │
│  ├── AssetUsageService (Atomic Stock Deductions & Validations)         │
│  ├── ReportService & ExcelExportService (Apache POI .xlsx & CSV)       │
│  └── EmailNotificationService (JavaMailSender / SMTP)                  │
├────────────────────────────────────────────────────────────────────────┤
│ Scheduler & Automation:                                                │
│  └── DailyPOThresholdScheduler (Daily 6:00 PM IST Cron Job)            │
├────────────────────────────────────────────────────────────────────────┤
│ Data Access Layer:                                                     │
│  └── Spring Data JPA / Hibernate Repositories                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ JDBC Connection
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Relational Database                    │
├────────────────────────────────────────────────────────────────────────┤
│  ├── admins                 ├── rate_contracts                         │
│  ├── users                  ├── call_up_purchase_orders                │
│  ├── employees              ├── asset_usages                           │
│  ├── cartridges             ├── procurement_alerts                     │
│  ├── assets                 └── cartridge_thresholds                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 18.3.1](https://react.dev/)
- **Build Tool / Bundler**: [Vite 6.0.1](https://vitejs.dev/)
- **Routing**: [React Router DOM 6.28.0](https://reactrouter.com/)
- **Icons**: [Lucide React 1.16.0](https://lucide.dev/)
- **Styling**: Vanilla CSS3 with unified design tokens (`index.css`), responsive layouts, modal overlays, and IOCL corporate branding.
- **Language**: JavaScript (ES Modules / JSX)

### Backend
- **Framework**: [Spring Boot 3.4.3](https://spring.io/projects/spring-boot)
- **Language**: Java 21 (LTS)
- **Web & REST**: Spring Web MVC, Spring Boot Starter Validation (`jakarta.validation`)
- **Security**: Spring Security 6 with stateless JWT (`io.jsonwebtoken:jjwt-api:0.12.6`) and BCrypt password hashing.
- **ORM & Data Access**: Spring Data JPA, Hibernate ORM, PostgreSQL JDBC Driver.
- **Email Delivery**: Spring Boot Starter Mail (`JavaMailSender`, Jakarta Mail, SMTP / TLS).
- **Excel Report Engine**: [Apache POI 5.3.0](https://poi.apache.org/) (`poi` and `poi-ooxml` for native `.xlsx` generation).
- **Environment Management**: `io.github.cdimascio:dotenv-java:3.0.0`
- **Build Tool**: Apache Maven

### Database
- **Database Engine**: [PostgreSQL](https://www.postgresql.org/) (Version 14+)
- **Testing Engine**: In-Memory H2 Database (for unit/integration test scope)

---

## 🧮 Core Business Logic

### 1. Rate Contract Net Availability
The available balance of an individual Rate Contract is computed strictly as:

$$\text{Net Available RC} = \text{Total Contract Quantity} - \text{Quantity Taken Vide Work Orders (Call-Up POs)}$$

**Example Calculation:**
- Total Contract Quantity = `2000`
- Quantity Taken Through Work Orders = `500`
- **Net Available RC** = `2000 - 500 = 1500 units`

*Note: In the database and API responses, `quantityAlreadyExecuted` reflects the total physical consumable quantity consumed by engineers from store stock.*

---

### 2. Multiple Rate Contracts for the Same Cartridge
In enterprise operations, IOCL may issue multiple Rate Contracts over time for the same cartridge (e.g., HP `CF277X` or Canon `070-BLK`) across different suppliers or financial cycles.

The system handles this through relational separation:
- Each Rate Contract remains an **independent database record** with its own contract date, supplier name, unit rate, tax rate, and WO deductions.
- Call-Up POs are explicitly deducted from their **specific parent Rate Contract**, reducing that contract's balance.
- Cartridge history and procurement registers display both **per-contract balances** and **aggregate cartridge balances**.

```
Cartridge: Canon 070-BLK (Store Stock: 30 units)
 │
 ├── Rate Contract A (Supplier: M/s Alpha Infotech)
 │    ├── Contract Quantity: 1000
 │    ├── WO Quantity Taken: 400
 │    └── Net Available RC:  600 units
 │
 └── Rate Contract B (Supplier: M/s Beta Solutions)
      ├── Contract Quantity: 1500
      ├── WO Quantity Taken: 500
      └── Net Available RC:  1000 units
────────────────────────────────────────────────────
Total Net Available across Rate Contracts = 1600 units
Total Combined Operational Availability   = 1600 + 30 = 1630 units
```

---

### 3. Store Inventory & Call-Up PO Atomic Workflow
When an Administrator creates a Call-Up Purchase Order against a Rate Contract:
1. **Locking & Validation**: The backend acquires a pessimistic lock (`PESSIMISTIC_WRITE`) on the Rate Contract and validates that requested quantity $\le$ contract net available quantity.
2. **Contract Deduction**: The Rate Contract's `quantityTakenThroughWO` is incremented, and its `netAvailableQuantity` is recalculated.
3. **Store Stock Increment**: The associated `cartridges.store_quantity` is **immediately incremented** by the PO quantity within the same database transaction.
4. **Alert Evaluation**: Threshold evaluation is triggered to update or resolve existing alerts.

---

### 4. Asset Usage & Store Stock Deduction Workflow
When a Service Engineer records a consumable usage:
1. **Identity Resolution**: The recording engineer is authoritatively derived from the verified JWT token (`User` entity).
2. **Validation**: Checks that quantity is between 1 and 1000, usage date is not in the future, and printer color matches the cartridge (Color printer requires color selection; B&W printer disallows color).
3. **Store Stock Verification & Deduction**: The cartridge store record is locked. If requested quantity exceeds `cartridges.store_quantity`, the transaction is rejected with an HTTP `400 Bad Request`. Otherwise, `store_quantity` is decremented atomically.
4. **Beneficiary Tracking**: The usage record stores the beneficiary employee number, employee name, department, seat/cabin number, location, and beneficiary email.
5. **Beneficiary Email Notification**: The system automatically dispatches a branded HTML email confirmation to the beneficiary's email address.
6. **Threshold Re-Evaluation**: Real-time evaluation checks if remaining quantities breach thresholds.

---

### 5. Tendering Alerts & Threshold Conditions

The system implements **two distinct alert mechanisms**:

| Alert Type | Database Enum | Severity | Business Formula | Trigger Condition | Primary Action / Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PO Threshold Alert** | `PROCUREMENT_THRESHOLD` | `NORMAL` | $\text{RC Net Available} \le \text{PO Threshold}$ | Rate Contract balance is low | Triggers email to Admin; recommends creating a Call-Up PO or new contract. Included in 6:00 PM IST daily summary. |
| **Tendering Required Alert** | `TENDERING_REQUIRED` | `URGENT` | $\text{Combined Net Available} < \text{Tendering Threshold}$<br>*(where Combined = Store Qty + RC Net Avail)* | Total organizational stock is critically low | Triggers urgent red-banner email to Admin; demands immediate procurement tendering. |

- **Auto-Resolution**: If stock is replenished (via a new Rate Contract or Call-Up PO) such that quantities exceed thresholds, active unread alerts are automatically marked as `READ` / resolved in the database.

---

## 👨‍💼 Admin Portal Modules

| Module Name | Route | Purpose & Key Features | Interacting Endpoints |
| :--- | :--- | :--- | :--- |
| **Admin Dashboard** | `/admin/dashboard` | Central command center showing high-level KPI cards (Total Contracts, Active POs, Store Stock, Critical Alerts), recent procurement records, and quick shortcuts. | `GET /api/procurement/rate-contracts`<br>`GET /api/alerts/count` |
| **Procurement Register** | `/admin/procurement` | Master tabbed interface for creating new Rate Contracts, issuing Call-Up POs, and viewing the active contract catalog with status badges. | `GET /api/procurement/rate-contracts`<br>`POST /api/procurement/rate-contracts` |
| **Rate Contract Details & History** | `/admin/procurement/rate-contracts/:id` | Detailed chronological audit trail for a single contract, displaying initial contract baseline, all issued Call-Up POs, and running balances. | `GET /api/procurement/rate-contracts/{id}`<br>`GET /api/procurement/history/rate-contract/{id}` |
| **Full View of Records** | `/admin/full-view` | Enterprise-wide paginated table of all procurement records with multi-parameter search, date filters, supplier filters, and sorting. | `GET /api/procurement/full-view` |
| **Threshold Settings** | `/admin/thresholds` | Configuration console to adjust PO Threshold and Tendering Threshold values for all active cartridges in the catalog. | `GET /api/thresholds`<br>`PUT /api/thresholds/{cartridgeId}` |
| **Tendering Alerts** | `/admin/tendering-alerts` | Alert dashboard displaying unread PO and Tendering alerts with severity filters (`NORMAL`, `URGENT`), item shortages, and mark-as-read actions. | `GET /api/alerts`<br>`PATCH /api/alerts/{id}/read` |
| **Asset Usage History** | `/admin/asset-usage-history` | Comprehensive audit trail of all consumable transactions recorded across IOCL, filterable by date range, department, location, engineer, and beneficiary. Includes CSV export. | `GET /api/admin/asset-usage/history`<br>`GET /api/admin/asset-usage/export` |
| **Employee Master** | `/admin/employees` | Canonical directory of IOCL staff with employee IDs, designations, cabin/seat numbers, departments, assigned printers, and active/inactive status toggles. | `GET /api/admin/employees`<br>`POST /api/admin/employees`<br>`PUT /api/admin/employees/{id}`<br>`PATCH /api/admin/employees/{id}/status` |
| **New Asset Addition** | `/admin/assets/new` | Form to register new physical printers/assets with serial numbers, model names, department assignments, printer types, and cartridge mapping. | `POST /api/assets`<br>`GET /api/procurement/cartridges` |
| **Update Asset** | `/admin/assets/update` | Catalog view to search, edit, update, or decommission existing physical printer assets and their department mappings. | `GET /api/assets`<br>`PUT /api/assets/{id}` |
| **Reports & Export** | `/admin/reports` | Comprehensive reporting engine supporting 6 report types, date/department/location filters, summary metrics, and 1-click **Excel (.xlsx)** and **CSV** downloads. | `GET /api/admin/reports/data`<br>`GET /api/admin/reports/export/excel`<br>`GET /api/admin/reports/export/csv` |

---

## 👤 User / Engineer Portal Modules

| Module Name | Route | Purpose & Key Features | Interacting Endpoints |
| :--- | :--- | :--- | :--- |
| **User Registration** | `/register`, `/user/register` | Public self-service registration for field engineers. Collects full name, username, employee ID, email, department, and location. Assigns `ROLE_USER`. | `POST /api/auth/user/register` |
| **User Login** | `/user/login` | Multi-identifier login allowing authentication via Username, Corporate Email, or Employee ID with password. Returns JWT token. | `POST /api/auth/user/login` |
| **User Dashboard** | `/user/dashboard` | Personalized engineer console displaying total units consumed, monthly usage count, recent activity stream, and system notifications. | `GET /api/user/dashboard` |
| **Record Asset Usage** | `/user/usage`, `/user/record-usage` | Core consumable issuance form with printer auto-detection, cartridge selection, store stock validation, employee directory search, and beneficiary email notification. | `POST /api/user/asset-usage`<br>`GET /api/user/asset-usage/beneficiaries/search` |
| **Asset History / My Usage** | `/user/asset-history`, `/user/usage-history` | Filterable, paginated audit log of consumable usages recorded strictly by the authenticated engineer (enforcing user data isolation). | `GET /api/user/asset-usage/paged` |
| **My Profile & Activity** | `/user/profile`, `/user/activity` | Displays engineer identity details, contact information, corporate credentials, and recent timestamped transaction logs. | `GET /api/user/dashboard` |

---

## 🔄 End-to-End Operational Workflow

```
[ Admin / Procurement Dept ]
             │
             ▼
   Create Rate Contract ────────────► [ rate_contracts table ]
             │
             ▼
   Issue Call-Up PO / WO ───────────► Deducts Rate Contract Available Qty
             │                        Atomically Increments Store Stock Qty
             ▼
   Store Stock Available in Warehouse
             │
             ▼
[ Field Service Engineer ]
             │
             ▼
   Log into User Portal (JWT Auth)
             │
             ▼
   Submit Consumable Usage ─────────► Validates Store Quantity Available
             │                        Atomically Deducts Store Stock
             │                        Records Engineer ID + Beneficiary Details
             │
             ├──────────────────────► Sends HTML Receipt Email to Beneficiary
             │
             ▼
[ Real-Time Alert Evaluation Service ]
             │
             ├──► IF (Rate Contract Net Avail <= PO Threshold)
             │         └──► Trigger Alert 1 (NORMAL) & Admin Email
             │
             └──► IF (Store Qty + RC Net Avail < Tendering Threshold)
                       └──► Trigger Alert 2 (URGENT) & Red Alert Admin Email
             │
             ▼
[ Scheduled Daily 6:00 PM IST Job ] ─► Consolidated Low-Stock Report Email to Admin
             │
             ▼
[ Admin Reports & Analytics ] ──────► Export .xlsx (Apache POI) / .csv on demand
```

---

## 📊 Reports & Export Engine

The system features a dedicated reporting engine (`AdminReportController`, `ReportServiceImpl`, `ExcelExportServiceImpl`) supporting **6 distinct report types**:

1. **Asset Usage Report** (`ASSET_USAGE`): Detailed logs of consumable issuance by date, engineer, beneficiary, department, location, cartridge, and color.
2. **Store Inventory Report** (`STORE_INVENTORY`): Current warehouse stock levels, total printers supported, and associated part numbers.
3. **Procurement / Rate Contract Report** (`PROCUREMENT`): Rate contract terms, supplier names, unit rates, tax percentages, total contract quantities, and remaining balances.
4. **Call-Up PO Report** (`CALL_UP_PO`): Issued work order quantities, PO dates, reference numbers, and remarks.
5. **Employee Master Report** (`EMPLOYEE`): Complete staff directory with designations, departments, cabin numbers, locations, and status.
6. **Store Stock Movement Report** (`STOCK_HISTORY`): Chronological stock balance changes from Call-Up PO receipts and asset usage issues.

### Available Filtering Options
- **Date Range**: `fromDate` and `toDate` filters (ISO `YYYY-MM-DD`).
- **Department & Location**: Multi-department and location filtering.
- **Consumable & Color**: Filter by Cartridge ID, Part Number, Printer Type, and Cartridge Color.
- **Personnel**: Filter by Recording Engineer or Beneficiary Employee ID/Name.
- **Search Query**: Universal free-text keyword search.

### Export Capabilities
- **Native Excel (.xlsx)**: Formatted workbooks generated server-side using Apache POI with bold headers, auto-sized columns, and clean styling.
- **CSV (.csv)**: Standard comma-delimited files for spreadsheet import.
- **Browser Print**: Formatted print preview stylesheets on the frontend.

---

## 📧 Email Notifications

The application integrates Spring Boot Mail (`JavaMailSender`) to deliver responsive, branded HTML and plain-text emails.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Email Notification Triggers                     │
├────────────────────────────────┬───────────────────┬───────────────────┤
│ Notification Event             │ Recipient         │ Template / Style  │
├────────────────────────────────┼───────────────────┼───────────────────┤
│ 1. Beneficiary Usage Receipt   │ Beneficiary Staff │ Branded HTML with │
│    (Triggered on Usage Submit) │ (From Form Email) │ item, qty & cabin │
├────────────────────────────────┼───────────────────┼───────────────────┤
│ 2. PO Threshold Alert (Alert 1)│ Administrator     │ Navy/Slate Header │
│    (Triggered on RC <= Thresh) │ (ADMIN_ALERT_EMAIL│ with shortfall    │
├────────────────────────────────┼───────────────────┼───────────────────┤
│ 3. URGENT Tendering Required   │ Administrator     │ Crimson Red Alert │
│    (Triggered on Comb < Thresh)│ (ADMIN_ALERT_EMAIL│ Header (High Pri) │
├────────────────────────────────┼───────────────────┼───────────────────┤
│ 4. Daily PO Threshold Report   │ Administrator     │ Consolidated table│
│    (Triggered Daily 6:00 PM)   │ (ADMIN_ALERT_EMAIL│ of all shortages  │
└────────────────────────────────┴───────────────────┴───────────────────┘
```

---

## 🗄️ Database Architecture

The application uses PostgreSQL with JPA entity mappings and automatic pre-JPA schema updates (`DatabaseMigrationPostProcessor`).

```
                    ┌─────────────────────────┐
                    │       cartridges        │
                    ├─────────────────────────┤
                    │ id (PK)                 │◄────────┐
                    │ part_number (UK)        │         │
                    │ cartridge_name          │         │
                    │ printer_name            │         │
                    │ store_quantity          │         │
                    │ active                  │         │
                    └────────────┬────────────┘         │
                                 │                      │
         ┌───────────────────────┼──────────────────────┤
         │ 1:M                   │ 1:M                  │ 1:1
         ▼                       ▼                      ▼
┌──────────────────┐   ┌──────────────────┐   ┌───────────────────────┐
│  rate_contracts  │   │      assets      │   │  cartridge_thresholds │
├──────────────────┤   ├──────────────────┤   ├───────────────────────┤
│ id (PK)          │   │ id (PK)          │   │ id (PK)               │
│ cartridge_id (FK)│   │ cartridge_id (FK)│   │ cartridge_id (FK, UK) │
│ contract_date    │   │ serial_no (UK)   │   │ po_threshold          │
│ supplier_name    │   │ model_name       │   │ tendering_threshold   │
│ rate_per_unit    │   │ department       │   └───────────────────────┘
│ total_quantity   │   │ printer_type     │
│ qty_taken_wo     │   │ colour           │
│ net_avail_qty    │   │ status           │
└────────┬─────────┘   └────────┬─────────┘
         │                      │
         │ 1:M                  │ 0..1:M
         ▼                      ▼
┌──────────────────────────┐   ┌───────────────────────────┐
│ call_up_purchase_orders  │   │       asset_usages        │
├──────────────────────────┤   ├───────────────────────────┤
│ id (PK)                  │   │ id (PK)                   │
│ rate_contract_id (FK)    │   │ user_id (FK -> users)     │
│ po_number (UK)           │   │ asset_id (FK -> assets)   │
│ po_date                  │   │ cartridge_id (FK -> cart.)│
│ supplier_name            │   │ recorded_by_employee_no   │
│ quantity                 │   │ beneficiary_employee_no   │
│ remarks                  │   │ beneficiary_department    │
└──────────────────────────┘   │ beneficiary_seat_or_cabin │
                               │ beneficiary_location      │
                               │ beneficiary_email         │
                               │ quantity_used             │
                               │ usage_date                │
                               └───────────────────────────┘
```

### Table Summary & Primary Constraints

| Table Name | Primary Key | Foreign Keys | Key Constraints & Indexes |
| :--- | :--- | :--- | :--- |
| `admins` | `id` (BIGSERIAL) | *None* | `email` UNIQUE |
| `users` | `id` (BIGSERIAL) | *None* | `username` UNIQUE, `email` UNIQUE, `employee_id` UNIQUE |
| `employees` | `id` (BIGSERIAL) | *None* | `employee_number` UNIQUE, Indexes on `full_name`, `department`, `status` |
| `cartridges` | `id` (BIGSERIAL) | *None* | `part_number` UNIQUE |
| `assets` | `id` (BIGSERIAL) | `cartridge_id` $\to$ `cartridges(id)` | `serial_number` UNIQUE |
| `cartridge_thresholds` | `id` (BIGSERIAL) | `cartridge_id` $\to$ `cartridges(id)` | `cartridge_id` UNIQUE |
| `rate_contracts` | `id` (BIGSERIAL) | `cartridge_id` $\to$ `cartridges(id)` | Index on `cartridge_id`, `contract_date` |
| `call_up_purchase_orders` | `id` (BIGSERIAL) | `rate_contract_id` $\to$ `rate_contracts(id)` | `po_number` UNIQUE, Index on `rate_contract_id` |
| `asset_usages` | `id` (BIGSERIAL) | `user_id` $\to$ `users(id)`<br>`cartridge_id` $\to$ `cartridges(id)`<br>`asset_id` $\to$ `assets(id)` | Indexes on `user_id`, `usage_date`, `beneficiary_employee_no`, `cartridge_id`, `beneficiary_department` |
| `procurement_alerts` | `id` (BIGSERIAL) | `cartridge_id` $\to$ `cartridges(id)` | Indexes on `cartridge_id`, `alert_type`, `status` |

---

## 🔐 Authentication & Security

- **Stateless JWT Tokens**: Signed using HMAC-SHA256 with configured 24-hour expiration (`app.jwt.expiration-ms=86400000`).
- **Password Security**: Passwords hashed with `BCryptPasswordEncoder` (strength 12) before database persistence.
- **Role-Based Authorization**:
  - `ROLE_ADMIN`: Access to all `/api/admin/**`, `/api/procurement/**`, `/api/thresholds/**`, `/api/alerts/**`, `/api/assets/**`, and `/api/full-view/**` endpoints.
  - `ROLE_USER`: Access to `/api/user/**` endpoints, read-only reference data (`/api/procurement/cartridges`, `/api/assets`).
- **User Data Isolation**: User portal queries automatically filter records by the authenticated user's ID extracted from JWT context.
- **CORS Protection**: Explicitly configured for allowed origins (e.g., `http://localhost:5173`, `http://localhost:3000`).
- **Pre-Flight Caching**: HTTP OPTIONS requests cached for 1 hour (`3600L`).

---

## 📁 Project Structure

```
consumables-automation-project/
├── .env.example                          # Root environment template
├── .gitignore                            # Git ignore rules
├── README.md                             # Authoritative project documentation
├── backend/                              # Spring Boot 3.4 Backend
│   ├── pom.xml                           # Maven dependencies (Java 21, Spring Boot, JJWT, POI)
│   └── src/
│       ├── main/
│       │   ├── java/com/iocl/procurement/
│       │   │   ├── ProcurementApplication.java
│       │   │   ├── config/               # Database migration & Dotenv config
│       │   │   ├── controller/           # REST API Controllers (11 controllers)
│       │   │   ├── dto/                  # Request, Response & Report DTOs
│       │   │   ├── entity/               # JPA Entities (10 core entities & enums)
│       │   │   ├── exception/            # Global exception handlers
│       │   │   ├── repository/           # Spring Data JPA Repositories
│       │   │   ├── scheduler/            # Daily PO Threshold Report Cron Job
│       │   │   ├── security/             # Spring Security, JWT Filters & UserDetails
│       │   │   ├── seeder/               # Database seeders (Admin, Cartridges, Employees)
│       │   │   └── service/              # Business Service Interfaces & Implementations
│       │   └── resources/
│       │       └── application.properties # Application properties & default bindings
│       └── test/                         # Unit and integration test suites
└── frontend/                             # React + Vite Frontend
    ├── index.html                        # Single-page application entry HTML
    ├── package.json                      # NPM dependencies (React 18, Vite, Lucide, Router)
    ├── vite.config.js                    # Vite configuration
    ├── public/
    │   ├── favicon.png                   # IOCL Favicon
    │   └── images/                       # Branding logos & assets
    └── src/
        ├── App.jsx                       # Root React component
        ├── main.jsx                      # React DOM render entry
        ├── index.css                     # Comprehensive CSS design system
        ├── components/
        │   ├── admin/                    # Admin components (Employee, Reports, Usage)
        │   ├── alerts/                   # Alert banners & badges
        │   ├── auth/                     # Auth login & registration cards
        │   ├── branding/                 # IOCL logo and header branding
        │   ├── layout/                   # DashboardLayout & UserLayout
        │   └── procurement/              # Procurement forms, tables & summary cards
        ├── context/                      # AuthContext for React state management
        ├── pages/
        │   ├── AdminDashboard.jsx        # Admin home dashboard
        │   ├── Login.jsx                 # Admin login page
        │   ├── admin/                    # Admin usage history, employee master, reports
        │   ├── alerts/                   # Tendering alerts console
        │   ├── assets/                   # New asset addition & asset update
        │   ├── auth/                     # User registration page
        │   ├── procurement/              # Procurement register, rate contract & PO forms
        │   ├── thresholds/               # Threshold limits configuration page
        │   └── user/                     # User dashboard, usage recording, profile, history
        ├── routes/
        │   ├── AppRoutes.jsx             # React Router route definitions
        │   └── ProtectedRoute.jsx        # Role-based route guard
        └── services/                     # Axios/Fetch API service modules (12 services)
```

---

## ⚙️ Prerequisites

Ensure the following tools are installed before setting up the project:

| Requirement | Recommended Version | Verification Command |
| :--- | :--- | :--- |
| **Java Development Kit (JDK)** | Java 21 (LTS) | `java -version` |
| **Apache Maven** | Maven 3.9+ | `mvn -version` |
| **Node.js** | Node 18.x or 20.x (LTS) | `node -v` |
| **NPM** | NPM 9.x or 10.x | `npm -v` |
| **PostgreSQL** | Version 14, 15, or 16 | `psql --version` |

---

## 🚀 Installation & Setup Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/anjalivarshney8923/consumables-automation-project.git
cd consumables-automation-project
```

---

### Step 2: PostgreSQL Database Setup
1. Open your terminal or PostgreSQL prompt (`psql`):
   ```sql
   CREATE DATABASE iocl_procurement;
   ```
2. *(Optional)* The backend is equipped with automatic schema initialization and pre-JPA safe migration (`DatabaseMigrationPostProcessor` and `AdminDataSeeder`). On initial boot, tables and baseline records are created automatically.

---

### Step 3: Configure Environment Variables
Copy `.env.example` in the root directory to `.env`:
```bash
cp .env.example .env
```

Edit `.env` to provide your local database and mail configuration:
```ini
# Server Port
SERVER_PORT=8080

# PostgreSQL Connection
DB_URL=jdbc:postgresql://localhost:5432/iocl_procurement
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password

# JWT Secret (Must be 256-bit secure key)
JWT_SECRET=<JWT_SECRET>
JWT_EXPIRATION_MS=86400000

# Initial Admin Seeding Credentials
ADMIN_NAME=IOCL Administrator
ADMIN_EMAIL=admin@iocl.co.in
ADMIN_PASSWORD=Admin@12345

# CORS Allowed Origins
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# SMTP Mail Settings
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_specific_password
MAIL_FROM=no-reply@iocl.in
ADMIN_ALERT_EMAIL=admin@iocl.co.in
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS=true
MAIL_ENABLED=true
```

---

### Step 4: Run the Backend
Navigate to the `backend/` directory and start Spring Boot via Maven:
```bash
cd backend
mvn clean spring-boot:run
```
The Spring Boot backend will start on: **`http://localhost:8080`**

*On startup, the system seeds the initial administrator account (`admin@iocl.co.in` / `Admin@12345`), active cartridge catalog, employee master directory, and default thresholds.*

---

### Step 5: Configure & Run the Frontend
Open a new terminal window, navigate to the `frontend/` directory, install dependencies, and start Vite:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on: **`http://localhost:5173`**

---

### Step 6: Access the Application
Open your web browser and navigate to: **`http://localhost:5173`**

#### Default Login Credentials

| Portal | URL | Default Username / Email | Default Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Portal** | `http://localhost:5173/login` | `admin@iocl.co.in` | `Admin@12345` | `ROLE_ADMIN` |
| **User Portal** | `http://localhost:5173/user/login` | Register new user at `/register` | User chosen password | `ROLE_USER` |

---

## 🛡️ Security / Environment Variables Reference

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `SERVER_PORT` | No | `8080` | Port on which the Spring Boot application listens. |
| `DB_URL` | Yes | `jdbc:postgresql://localhost:5432/iocl_procurement` | JDBC connection URL for PostgreSQL. |
| `DB_USERNAME` | Yes | `postgres` | Database username. |
| `DB_PASSWORD` | Yes | `<DB_PASSWORD>` | Database password. |
| `JWT_SECRET` | Yes | *Pre-configured 256-bit Hex Key* | Secret HMAC-SHA key for signing and validating JWTs. |
| `JWT_EXPIRATION_MS` | No | `86400000` (24 Hours) | Token validity duration in milliseconds. |
| `ADMIN_NAME` | No | `IOCL Administrator` | Display name of the seeded default administrator. |
| `ADMIN_EMAIL` | Yes | `admin@iocl.co.in` | Login email for the default administrator. |
| `ADMIN_PASSWORD` | Yes | `Admin@12345` | Password for the default administrator (hashed via BCrypt). |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000,http://localhost:5173` | Comma-separated list of allowed frontend origins. |
| `MAIL_HOST` | No | `smtp.gmail.com` | SMTP relay server host. |
| `MAIL_PORT` | No | `587` | SMTP port (typically 587 for TLS). |
| `MAIL_USERNAME` | No | `your_email@gmail.com` | SMTP authentication username. |
| `MAIL_PASSWORD` | No | `your_app_password` | SMTP app-specific password. |
| `MAIL_FROM` | No | `no-reply@iocl.in` | Sender address shown in the "From" header. |
| `ADMIN_ALERT_EMAIL`| No | `admin@iocl.co.in` | Destination email address for threshold and tendering alerts. |
| `MAIL_ENABLED` | No | `true` | Boolean flag to enable/disable automated outbound emails. |
| `VITE_API_BASE_URL` | No | `http://localhost:8080` | Frontend backend API URL (in `frontend/.env`). |

---

## 🧪 Testing Checklist

The system can be validated across the following operational workflows:

- [x] **Authentication & Role Guards**:
  - Admin login with valid credentials yields JWT and redirects to `/admin/dashboard`.
  - User login accepts username, email, or employee ID.
  - Accessing `/admin/*` with `ROLE_USER` redirects or returns HTTP 403 Forbidden.
- [x] **Rate Contract Creation**:
  - Create Rate Contract with supplier, cartridge, unit rate, tax %, and total quantity.
  - Verify initial `netAvailableQuantity` equals `totalContractQuantity`.
- [x] **Call-Up Purchase Order Validation**:
  - Issue Call-Up PO with quantity $\le$ net available quantity.
  - Verify Rate Contract balance decrements and store stock increment matches.
  - Attempting to issue a Call-Up PO exceeding remaining contract quantity returns HTTP 400.
- [x] **Multiple Rate Contracts for Same Part Number**:
  - Create Contract 1 (`1000` units) and Contract 2 (`1500` units) for `Canon 070-BLK`.
  - Issue a PO of `300` units against Contract 1; verify Contract 2 remains at `1500`.
- [x] **Asset Usage & Store Stock Deduction**:
  - Submit asset usage for an active cartridge; verify store inventory decrements by exact quantity.
  - Submitting quantity exceeding available store stock triggers validation error.
  - Enforce color validation: B&W printers reject color input; Color printers require color selection.
- [x] **Alert 1 (PO Threshold)**:
  - Reduce Rate Contract net available quantity to $\le$ PO threshold; verify alert creation and email dispatch.
- [x] **Alert 2 (URGENT Tendering Required)**:
  - Reduce combined quantity (Store + RC) below tendering threshold; verify `URGENT` alert creation and red email dispatch.
- [x] **Reports & Export**:
  - Filter Asset Usage and Store Inventory reports by date and department.
  - Verify downloaded `.xlsx` opens cleanly in Microsoft Excel with formatted columns.
  - Verify downloaded `.csv` contains exact matching records.

---

## 🖼️ Screenshots

> *Place screenshots of the application inside the `screenshots/` directory using the filenames below.*


https://github.com/anjalivarshney8923/consumables-automation-project/screenshots/user-register.png


### Admin Portal
```
screenshots/
├── admin-dashboard.png            # Admin Dashboard with KPI summary cards
├── procurement-register.png       # Procurement Register & Rate Contracts
├── rate-contract-details.png      # Rate Contract Details with chronological running balance
├── full-view-records.png          # Full View of Procurement Records table
├── tendering-alerts.png           # Tendering & Threshold Alerts console
├── threshold-settings.png         # Threshold Limits configuration view
├── employee-master.png            # Canonical Employee Master directory
└── admin-reports.png              # Multi-Domain Reports & Export view
```

### User Portal
```
screenshots/
├── user-register.png                 # User / Engineer Register page
├── user-dashboard.png             # User Dashboard with personalized metrics
├── record-usage.png               # Consumable Usage recording form
└── my-usage-history.png           # Engineer's individual usage history
```

---


## 🚀 Deployment Considerations

> **Note**: Production deployment configuration is not included in the current repository.

When deploying to a production server:
1. **Database**: Use a managed PostgreSQL instance (e.g., AWS RDS, Azure Database for PostgreSQL, or dedicated on-premise PostgreSQL) with connection pooling.
2. **Backend**: Package the Spring Boot JAR (`mvn clean package -DskipTests`) and run behind a reverse proxy (e.g., Nginx or Apache) with TLS/HTTPS enabled.
3. **Frontend**: Build the production bundle (`npm run build`) and serve static assets via Nginx, AWS S3/CloudFront, or a web server.
4. **Environment Variables**: Configure all secrets (database passwords, JWT secret, SMTP credentials) strictly via operating system environment variables or secure key vaults.

---

## 🌱 Future Scope

The following architectural enhancements are planned as future extensions:

- 🔄 **Enterprise SSO / LDAP Integration**: Native integration with IOCL Active Directory / Single Sign-On (SSO) systems.
- 📱 **Mobile Application**: Cross-platform mobile app (React Native / Flutter) for field engineers to scan QR/barcodes on printer cartridges.
- 🤖 **Automated Predictive Forecasting**: Machine learning algorithms to predict cartridge exhaustion dates based on historical departmental consumption patterns.
- 🏢 **Multi-Refinery / Multi-Location Partitioning**: Tenant-based segregation for different IOCL refineries and divisional headquarters.
- 📜 **Digital Signature & Approval Workflows**: Multi-stage approval hierarchy for high-value Rate Contracts and Call-Up PO releases.
- 🗄️ **Enterprise Database Migrations**: Optional adapters for Oracle Database 19c / 21c and Microsoft SQL Server enterprise deployments.

---

## 🎯 Project Outcomes

- **100% Elimination of Manual Stock Discrepancies**: Unified database links Call-Up PO receipts directly to store quantities and usage submissions directly to store deductions.
- **Proactive Stockout Prevention**: Automated real-time evaluation of PO thresholds and combined tendering thresholds with multi-channel email alerts.
- **Enhanced Accountability**: Full audit trail of both the recording engineer and the beneficiary employee (cabin, location, and department) for every consumable issued.
- **Instant Compliance Reporting**: Seamless 1-click export of structured Excel (`.xlsx`) and CSV reports for administrative review and financial audits.

---

## 👩‍💻 Project Information

- **Project Title**: IOCL Consumables & Procurement Management System
- **Application Type**: Full-Stack Enterprise Web Application
- **Author**: Anjali Varshney
- **Organization / Institution**: Indian Oil Corporation Limited (IOCL)
- **Repository**: `https://github.com/anjalivarshney8923/consumables-automation-project`
- **Backend Stack**: Java 21, Spring Boot 3.4.3, Spring Security, Spring Data JPA, PostgreSQL, Apache POI, JavaMailSender
- **Frontend Stack**: React 18, Vite 6, React Router 6, Lucide Icons, Vanilla CSS Design System

---

## 📄 License

This project was developed for **Indian Oil Corporation Limited (IOCL)** for administrative and operational automation purposes. All rights reserved.