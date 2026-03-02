# 🏦 SecureCore Banking: Enterprise-Grade Financial System

A robust, high-performance Core Banking system focused on **Zero-Trust Security** and **Absolute Data Consistency**. This project transcends standard CRUD applications by implementing financial-grade protocols, including DPoP (RFC 9449), Double-entry bookkeeping, and advanced concurrency control.

---

## 🛡️ Core Security Architecture (Zero-Trust)

The system operates on a **Zero-Trust** philosophy, assuming the network is compromised and requiring cryptographic proof for every interaction.

### 1. DPoP (Demonstrating Proof-of-Possession)
Unlike traditional "Bearer" tokens which can be used by anyone who steals them, this system binds tokens to a specific device.
- **Client-Side:** Upon initialization, the React client generates an **RSA/RS256** key pair. The Public Key is registered during login, while the Private Key is stored securely in **IndexedDB** (immune to XSS/LocalScript access).
- **Backend-Side:** A custom `DPoPGuard` validates the `DPoP` header—a JWT signed by the client's private key—ensuring the request originated from the authorized hardware.

### 2. Anti-Tampering & Payload Hashing (`ph` claim)
To prevent **Man-in-the-Middle (MitM)** attacks and data tampering:
- The Frontend intercepts outgoing requests, serializes the payload, and computes a **SHA-256 hash**.
- This hash is embedded into the `ph` (Payload Hash) claim of the DPoP proof.
- The Backend re-hashes the `rawBody` and compares it. If a single byte is altered in transit, the request is rejected.

### 3. Advanced Token Management
- **Token Family & Booby Traps:** Implements **Refresh Token Rotation**. If a leaked/old Refresh Token is reused, the system detects a "Replay" and instantly revokes the entire **Token Family**, locking all sessions for that user.
- **RAM-Only Access Tokens:** In the Frontend, Access Tokens are stored exclusively in **Redux State (RAM)**. A **Silent Refresh** mechanism restores the session upon page reload via a secure Refresh Token.

---

## 💸 Financial Integrity & Concurrency

### 1. Data Consistency (ACID)
- **Double-Entry Bookkeeping:** Every transaction generates a minimum of two ledger entries (DEBIT/CREDIT), ensuring the balance sheet always zeroes out.
- **Precision:** Uses `Decimal(20,4)` at the database level to eliminate JavaScript/Floating-point rounding errors.

### 2. Concurrency Control
To handle thousands of simultaneous transfers without "Double Spending":
- **Pessimistic Write Locking:** During balance updates, the system invokes `pessimistic_write` row-level locks to queue competing transactions.
- **Optimistic Locking:** Utilizes `@VersionColumn` to prevent "Lost Updates" during non-locking reads.
- **Idempotency:** APIs support `x-idempotency-key`. Retried requests due to network timeouts will not trigger duplicate transfers.

---

## 🏗️ System Architecture

The project follows **Domain-Driven Design (DDD)** principles and a **Feature-based Module** structure for maximum scalability.

### Backend (NestJS)
- **Event-Driven:** Uses `@nestjs/event-emitter` to decouple core logic from side effects (e.g., sending WebSockets after a successful DB commit).
- **Async Audit Logging:** A custom `AuditLogInterceptor` captures `oldValue` vs `newValue`, IP, and User-Agent asynchronously, ensuring zero latency impact on the main API thread.

### Frontend (React)
- **State Management:** Redux Toolkit handles complex Thunks for cryptographic key generation and multi-step transaction flows.
- **RBAC & Guarding:** Centralized `AuthGuard` and `RoleGuard` manage access to `AdminTemplate` and `UserTemplate`.
- **2FA Integration:** A flexible middleware intercepts the flow if `isTwoFactorEnabled` is flagged, requiring OTP validation before sensitive actions.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19 (Vite), Redux Toolkit, Tailwind CSS v4, Shadcn UI, Axios |
| **Backend** | NestJS, TypeScript, TypeORM |
| **Database** | PostgreSQL (Primary), Redis (Token Caching & Rate Limiting) |
| **Real-time** | Socket.io (Transaction Notifications) |
| **Crypto** | Web Crypto API (Browser), `jose` (JWT/DPoP), SHA-256 |

---

## 📂 Project Structure

```text
.
├── backend-core/
│   ├── src/
│   │   ├── modules/ (auth, accounts, transactions, notifications)
│   │   ├── common/ (guards, interceptors, decorators, filters)
│   │   ├── database/ (migrations, entities, seeds)
│   │   └── main.ts
├── frontend-web/
│   ├── src/
│   │   ├── api/ (axios-interceptor, dpop-service)
│   │   ├── store/ (slices, thunks)
│   │   ├── components/ (ui, shared, guards)
│   │   ├── pages/ (dashboard, transfer, settings,...)
│   │   └── App.tsx
└── docker-compose.yml