# TXG - Transaction Management System

A distributed microservices-based transaction management system with guaranteed audit logging and event-driven architecture.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Decisions](#architecture-decisions)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the Services](#running-the-services)
- [API Documentation](#api-documentation)
- [Testing UI](#testing-ui)
- [Testing](#testing)
- [Key Features](#key-features)

---

## System Overview

This system consists of two microservices:

1. **Transaction Service** - Manages financial transactions with full CRUD operations
2. **Audit Service** - Maintains an immutable audit log of all transaction operations

Both services communicate asynchronously through RabbitMQ with guaranteed delivery using the Transactional Outbox pattern.

### Technology Stack

- **Runtime**: Node.js
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL (separate databases per service)
- **Message Broker**: RabbitMQ
- **Authentication**: JWT
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose

---

## Architecture Decisions

### 1. Inter-Service Communication: RabbitMQ with Transactional Outbox Pattern

**Decision**: Use RabbitMQ as a message broker with the Transactional Outbox pattern for reliable event delivery.

**Rationale**:

- **Guaranteed Delivery**: The Outbox pattern ensures that events are never lost. Events are written to the database in the same transaction as the business operation, then asynchronously published by a background worker.
- **Decoupling**: Services don't need to know about each other's locations or availability. The audit service can be down temporarily without affecting transaction operations.
- **Idempotency**: Events contain unique `eventId` fields, allowing the audit service to detect and handle duplicate messages gracefully.
- **Scalability**: RabbitMQ's topic exchange allows for flexible routing and easy addition of new consumers.
- **Resilience**: Failed messages are automatically retried (up to 3 times) and moved to a Dead Letter Queue (DLQ) for manual inspection.

**Alternative Considered**: Direct HTTP calls were rejected because they would create tight coupling and make the system vulnerable to cascading failures.

**How It Works**:

```ascii
Transaction Operation → DB Transaction (Data + Outbox Event) → Commit
                                                                   ↓
                                              Outbox Processor (polls every 1s)
                                                                   ↓
                                              RabbitMQ Topic Exchange
                                                                   ↓
                                              Audit Service Consumer
                                                                   ↓
                                              Audit Log Created
```

### 2. Schema Sharing: Local NPM Package (`@txg/shared-contracts`)

**Decision**: Use a local NPM package for shared TypeScript types, event schemas, and validators.

**Rationale**:

- **Type Safety**: Compile-time validation of event structures across service boundaries.
- **Single Source of Truth**: Event schemas are defined once and imported by both services.
- **Runtime Validation**: The `EventValidator` class provides runtime checks to ensure messages conform to expected schemas.
- **Versioning**: Event schemas include a `version` field for future evolution.
- **Developer Experience**: IntelliSense and autocomplete work across service boundaries.

**Production Considerations**:
In a real-world scenario, this package would be:

- Published to a private NPM registry (npm Enterprise, Artifactory, or GitHub Packages)
- Versioned using semantic versioning
- Or managed as a Git submodule with CI/CD integration

**Package Structure**:

```bash
shared-contracts/
├── src/
│   ├── enums/audit-enums.ts          # Shared enums
│   ├── events/base-event.ts          # Base event interface
│   ├── events/transaction-events.ts  # Transaction event types
│   └── validators/event-validator.ts # Runtime validation
└── package.json
```

### 3. Audit Log Consistency Guarantees

**How We Ensure Consistency**:

1. **Transactional Outbox Pattern**:
   - Business data and outbox event are written in a single database transaction
   - If the transaction fails, neither the data nor the event is persisted
   - This guarantees: "No orphaned audit logs"

2. **Idempotent Event Processing**:

   ```typescript
   const existingLog = await this.auditLogRepo.findByEventId(dto.eventId);
   if (existingLog) {
     return existingLog; // Already processed
   }
   ```

   - Duplicate events (due to retries) are detected via `eventId`
   - The audit service returns the existing log without error

3. **Outbox Processor**:
   - Polls for pending events every 1 second
   - Processes events in batches (default: 10)
   - Marks events as `PROCESSED` or `FAILED` after publishing
   - Retries failed events up to 3 times before giving up

4. **Dead Letter Queue**:
   - Messages that fail after retries are moved to a DLQ
   - Allows for manual inspection and replay

**Testing Consistency** (covered in E2E tests):

- Transaction succeeds → Audit log exists
- Transaction fails → No audit log created
- Audit service down → Transaction succeeds, event queued
- Duplicate event → Audit log not duplicated

---

## Project Structure

```bash
.
├── transaction-service/          # Transaction management service
│   ├── src/
│   │   ├── application/          # Use cases and DTOs
│   │   ├── domain/               # Business entities and rules
│   │   ├── infrastructure/       # DB, messaging, auth
│   │   └── presentation/         # API routes and middleware
│   └── Dockerfile
│
├── audit-service/                # Audit logging service
│   ├── src/
│   │   ├── application/          # Use cases and DTOs
│   │   ├── domain/               # Audit log entity
│   │   ├── infrastructure/       # DB and RabbitMQ consumer
│   │   └── presentation/         # Query API
│   └── Dockerfile
│
├── shared-contracts/             # Shared event schemas
│   └── src/
│       ├── enums/
│       ├── events/
│       └── validators/
│
├── docker-compose.yml
└── README.md
```

### Clean Architecture Layers

Each service follows hexagonal architecture:

- **Domain**: Business logic, entities, and repository interfaces (ports)
- **Application**: Use cases (orchestration of domain logic)
- **Infrastructure**: Implementations of repository ports, external integrations
- **Presentation**: HTTP API layer (routes, middleware, validation schemas)

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ahmedheltaher/txg
cd txg
```

### 2. Environment Variables

The `docker-compose.yml` file includes all necessary environment variables. For local development, create `.env` files:

**transaction-service/.env**:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://txuser:txpassword@localhost:5432/transactions
RABBITMQ_URL=amqp://guest:guest@localhost:5672
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
OUTBOX_BATCH_SIZE=10
OUTBOX_POLL_INTERVAL_MS=1000
```

**audit-service/.env**:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://audituser:auditpassword@localhost:5433/audit
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

---

## Running the Services

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

**Services will be available at**:

- **Transaction Service**: <http://localhost:3000>
- **Audit Service**: <http://localhost:3001>
- **Testing UI**: <http://localhost:8080>
- **RabbitMQ Management**: <http://localhost:15672> (guest/guest)

### Local Development

```bash
# Install dependencies for shared contracts
cd shared-contracts
npm install
npm run build

# Install and run Transaction Service
cd ../transaction-service
npm install
npm run dev

# Install and run Audit Service (in another terminal)
cd ../audit-service
npm install
npm run dev
```

**Note**: Ensure PostgreSQL and RabbitMQ are running locally and update connection strings accordingly.

---

## API Documentation

Both services expose Swagger/OpenAPI documentation:

- **Transaction Service**: <http://localhost:3000/docs>
- **Audit Service**: <http://localhost:3001/docs>

### Quick Start Example

#### 1. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response:

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Create Transaction

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.50,
    "currency": "USD",
    "description": "Test transaction"
  }'
```

#### 3. Query Audit Logs

```bash
curl -X GET "http://localhost:3001/audit-logs?userId=<user-id>&page=1&limit=10"
```

### Transaction Service Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | User login |
| POST | `/transactions` | ✅ | Create transaction |
| GET | `/transactions` | ✅ | List transactions (paginated) |
| GET | `/transactions/:id` | ✅ | Get single transaction |
| PUT | `/transactions/:id` | ✅ | Update transaction status |
| DELETE | `/transactions/:id` | ✅ | Delete transaction |

### Audit Service Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/audit-logs` | ❌ | Query audit logs with filters |

**Query Parameters**:

- `userId`, `aggregateId`, `aggregateType`, `action`, `status`
- `startDate`, `endDate` (ISO 8601 format)
- `page`, `limit`

---

## Testing UI

A web-based testing interface is included to help you interact with the system.

### Accessing the UI

Visit <http://localhost:8080> after starting the services with Docker Compose.

### Features

The testing UI provides:

- **User Authentication**: Login with pre-seeded test users
- **Transaction Management**:
  - Create new transactions with amount, currency, and description
  - View all transactions in a table format
  - Update transaction status (PENDING → COMPLETED/FAILED/CANCELLED)
  - Delete transactions (only non-completed ones)
- **Audit Log Viewer**:
  - View all audit logs with filtering options
  - Filter by user, action type, status, and date range
  - Pagination support for large datasets
- **Real-time Updates**: See changes reflected immediately after operations

### Usage

1. **Login**: Use one of the default test users:
   - Email: `test@example.com` / Password: `password123`
   - Email: `admin@example.com` / Password: `password123`

2. **Create Transactions**: Fill in the form with amount, currency, and optional description

3. **Manage Transactions**: Click on transactions to view details, update status, or delete

4. **View Audit Logs**: Switch to the Audit Logs tab to see the complete audit trail of all operations

### Benefits for Testing

- **Visual Feedback**: See the system's behavior in real-time
- **Audit Trail Verification**: Easily verify that every transaction operation creates a corresponding audit log
- **Quick Iteration**: Rapidly test different scenarios without writing scripts

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run E2E tests only
npm run test:e2e

```

### Test Coverage

The test suite includes:

#### Happy Path Scenarios

- User can login successfully
- User can create a transaction (audit log created)
- User can update a transaction (audit log created)
- User can delete a transaction (audit log created)
- User can list transactions with pagination
- Audit logs can be queried and filtered

---

## Key Features

### Data Integrity

- Transactional Outbox pattern prevents data loss
- Database constraints (unique indexes, foreign keys)
- Validation at multiple layers (presentation, application, domain)

### Observability

- Structured logging with Pino
- Health check endpoints (`/health`)
- RabbitMQ management UI for queue monitoring
- Dead Letter Queue for failed messages

### Scalability

- Stateless services (horizontal scaling ready)
- Separate databases per service
- Async communication via message broker
- Configurable batch sizes and polling intervals

---

## Configuration Options

### Transaction Service

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | HTTP server port |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `RABBITMQ_URL` | - | RabbitMQ connection string |
| `JWT_SECRET` | - | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | 24h | Token expiration time |
| `OUTBOX_BATCH_SIZE` | 10 | Events processed per batch |
| `OUTBOX_POLL_INTERVAL_MS` | 1000 | Polling frequency (ms) |

### Audit Service

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | HTTP server port |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `RABBITMQ_URL` | - | RabbitMQ connection string |

---

## Monitoring & Debugging

### Check Service Health

```bash
# Transaction Service
curl http://localhost:3000/health

# Audit Service
curl http://localhost:3001/health
```

### Inspect RabbitMQ Queues

Visit <http://localhost:15672> (guest/guest) to:

- View queue depths
- Inspect dead letter queues
- Monitor message rates
- Check consumer status

### View Database Contents

```bash
# Transaction Service DB
docker exec -it transaction-db psql -U txuser -d transactions

# Audit Service DB
docker exec -it audit-db psql -U audituser -d audit
```

Useful queries:

```sql
-- Check outbox events
SELECT * FROM outbox_events ORDER BY created_at DESC LIMIT 10;

-- Check audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;

-- Check for pending events
SELECT COUNT(*) FROM outbox_events WHERE status = 'PENDING';
```

---

## Default Test Users

The system seeds two test users on startup:

| Email | Password | Use Case |
|-------|----------|----------|
| <test@example.com> | password123 | General testing |
| <admin@example.com> | password123 | Admin testing |
