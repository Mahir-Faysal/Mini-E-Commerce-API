# Mini E-Commerce API

A backend RESTful API for a mini e-commerce platform built with **Node.js**, **Express**, and **PostgreSQL**. Features JWT authentication, role-based access control, product management, cart operations, order processing with database transactions, payment simulation, and fraud prevention.

> **Live API:** [https://mini-e-commerce-api.onrender.com](https://mini-e-commerce-api.onrender.com)

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** (v18+) | Runtime environment |
| **Express.js** (v4.21) | Web framework |
| **PostgreSQL** (v17) | Relational database |
| **Sequelize** (v6.37) | ORM — models, associations, migrations, transactions |
| **JSON Web Token** (JWT) | Stateless authentication |
| **bcryptjs** | Password hashing (salt rounds: 10) |
| **express-validator** | Request input validation |
| **cors** | Cross-Origin Resource Sharing |
| **dotenv** | Environment variable management |
| **nodemon** | Development auto-reload (dev dependency) |

---

## Setup Instructions

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **PostgreSQL** installed and running — [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/Mahir-Faysal/Mini-E-Commerce-API.git
cd Mini-E-Commerce-API
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your PostgreSQL credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_ecommerce
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h
MAX_CANCELLATIONS_PER_DAY=3
```

### 4. Create the Database

Using `psql`:

```bash
psql -U postgres -c "CREATE DATABASE mini_ecommerce;"
```

Or using **pgAdmin 4**: Right-click "Databases" → Create → Database → Name: `mini_ecommerce`

### 5. Seed Sample Data

```bash
npm run seed
```

This creates:
- **Admin:** `admin@ecommerce.com` / `admin123`
- **Customer:** `customer@ecommerce.com` / `customer123`
- **8 sample products** (headphones, keyboard, power bank, etc.)

### 6. Start the Server

```bash
# Development (auto-reload on file changes)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:3000**

---

## Database Schema / ER Diagram

### Entity Relationship Diagram

```
┌─────────────────────┐
│       Users          │
├─────────────────────┤
│ id          (PK)     │
│ name        VARCHAR   │
│ email       VARCHAR   │◄── UNIQUE
│ password    VARCHAR   │◄── bcrypt hashed
│ role        ENUM      │◄── 'admin' | 'customer'
│ cancellationCount INT │
│ lastCancellationDate  │
│ createdAt             │
│ updatedAt             │
└────────┬────────────┘
         │
         │ 1:1                    1:N
         ▼                        ▼
┌─────────────────┐     ┌─────────────────────┐
│     Carts        │     │      Orders          │
├─────────────────┤     ├─────────────────────┤
│ id        (PK)   │     │ id          (PK)     │
│ userId    (FK)   │     │ userId      (FK)     │
│ createdAt        │     │ totalAmount DECIMAL   │
│ updatedAt        │     │ status      ENUM      │◄── pending|confirmed|
└────────┬────────┘     │ paymentStatus ENUM    │    shipped|delivered|
         │              │ paymentMethod VARCHAR │    cancelled
         │ 1:N          │ paidAt      TIMESTAMP │
         ▼              │ shippingAddress TEXT   │
┌─────────────────┐     │ createdAt             │
│   CartItems      │     │ updatedAt             │
├─────────────────┤     └────────┬──────────────┘
│ id       (PK)    │              │
│ cartId   (FK)    │              │ 1:N
│ productId(FK)    │              ▼
│ quantity  INT    │     ┌─────────────────────┐
│ createdAt        │     │    OrderItems        │
│ updatedAt        │     ├─────────────────────┤
└─────────────────┘     │ id           (PK)    │
                        │ orderId      (FK)    │
┌─────────────────┐     │ productId    (FK)    │
│    Products      │     │ quantity     INT     │
├─────────────────┤     │ priceAtPurchase DEC  │◄── Price snapshot
│ id        (PK)   │     │ createdAt           │
│ name      VARCHAR│     │ updatedAt           │
│ description TEXT │     └─────────────────────┘
│ price    DECIMAL │
│ stock    INTEGER │
│ imageUrl VARCHAR │
│ createdAt        │
│ updatedAt        │
└─────────────────┘
```

### Relationships

| Relationship | Type | Description |
|---|---|---|
| User ↔ Cart | **One-to-One** | Each user has exactly one cart (auto-created at registration) |
| Cart ↔ CartItem | **One-to-Many** | A cart contains multiple items |
| User ↔ Order | **One-to-Many** | A user can have multiple orders |
| Order ↔ OrderItem | **One-to-Many** | An order contains multiple items |
| Product ↔ CartItem | **One-to-Many** | A product can appear in multiple carts |
| Product ↔ OrderItem | **One-to-Many** | A product can appear in multiple orders |

All foreign keys use `CASCADE` on delete.

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |
| `GET` | `/api/auth/profile` | Protected | Get current user profile |

### Products (`/api/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | Public | List products (search, filter, paginate, sort) |
| `GET` | `/api/products/:id` | Public | Get single product by ID |
| `POST` | `/api/products` | Admin | Create a new product |
| `PUT` | `/api/products/:id` | Admin | Update product details |
| `DELETE` | `/api/products/:id` | Admin | Delete a product |
| `PATCH` | `/api/products/:id/stock` | Admin | Update product stock |

**Query Parameters for `GET /api/products`:**

| Param | Example | Description |
|-------|---------|-------------|
| `search` | `?search=keyboard` | Search by name or description |
| `minPrice` | `?minPrice=10` | Minimum price filter |
| `maxPrice` | `?maxPrice=50` | Maximum price filter |
| `sortBy` | `?sortBy=price` | Sort field (name, price, createdAt) |
| `sortOrder` | `?sortOrder=ASC` | Sort direction (ASC or DESC) |
| `page` | `?page=2` | Page number |
| `limit` | `?limit=5` | Items per page |

### Cart (`/api/cart`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/cart` | Customer | View cart with all items and total |
| `POST` | `/api/cart/items` | Customer | Add product to cart |
| `PUT` | `/api/cart/items/:itemId` | Customer | Update item quantity |
| `DELETE` | `/api/cart/items/:itemId` | Customer | Remove item from cart |
| `DELETE` | `/api/cart` | Customer | Clear entire cart |

### Orders (`/api/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders` | Customer | Place order from cart (checkout) |
| `GET` | `/api/orders` | Any | List orders (customers: own, admin: all) |
| `GET` | `/api/orders/:id` | Any | Get order details |
| `PUT` | `/api/orders/:id/cancel` | Any | Cancel order (with fraud prevention) |
| `PATCH` | `/api/orders/:id/status` | Admin | Update order status |
| `POST` | `/api/orders/:id/pay` | Any | Simulate payment |

---

## Key Architectural Decisions

### 1. Database Transactions with Row-Level Locking
Order placement wraps **all operations** (stock validation, order creation, stock deduction, cart clearing) in a single Sequelize transaction. Uses `SELECT ... FOR UPDATE` (row-level locking) to prevent race conditions where two users might purchase the last item simultaneously.

### 2. Price Snapshot at Purchase Time
`OrderItem.priceAtPurchase` captures the product price when the order is placed. Even if an admin updates the product price later, existing order totals remain accurate and auditable.

### 3. Backend-Calculated Totals
Order totals are **always** calculated server-side from `product.price × quantity`. The API never trusts client-submitted totals, preventing price manipulation.

### 4. Fraud Prevention System
Customers are limited to a configurable number of order cancellations per day (`MAX_CANCELLATIONS_PER_DAY`). This prevents abuse where users repeatedly order → cancel to manipulate stock availability. The limit resets daily and does not apply to admins.

### 5. Order Status State Machine
Status transitions are strictly enforced:
```
pending → confirmed → shipped → delivered
   ↓          ↓
 cancelled  cancelled
```
Invalid transitions (e.g., `delivered → pending`) are rejected with a `400` error.

### 6. Atomic Registration
User creation and cart creation are wrapped in a database transaction. If cart creation fails, the user is rolled back — preventing orphan records.

### 7. Consistent API Response Format
All endpoints return a consistent JSON structure:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

### 8. Layered Architecture
```
Routes → Validators → Middleware → Controllers → Models → Database
```
Each layer has a single responsibility, keeping the code clean, maintainable, and testable.

---

## Assumptions Made

1. **One Cart Per User** — Each user has exactly one cart, automatically created at registration (1:1 relationship).
2. **Public Product Browsing** — Product listing and search do not require authentication (like any real e-commerce store).
3. **Admin Registration** — Admin role can be assigned during registration for demo/testing purposes. In production, this would be restricted to a super-admin or seed-only.
4. **Payment Simulation** — Payment has a 90% simulated success rate. Failed payments return `402` and can be retried. Supported methods: `credit_card`, `debit_card`, `mobile_banking`, `cash_on_delivery`, `paypal`, `bank_transfer`.
5. **Stock Deduction Timing** — Stock is deducted only after successful order placement and restored on cancellation.
6. **Cancellation Scope** — Only `pending` and `confirmed` orders can be cancelled. `shipped` and `delivered` orders cannot.
7. **Soft Business Rules** — The daily cancellation limit is configurable via environment variables.
8. **No Image Upload** — `imageUrl` is stored as a URL string (external hosting assumed).

---

## Project Structure

```
Mini-E-Commerce-API/
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and scripts
├── README.md                   # This file
└── src/
    ├── server.js               # Entry point — DB connect + start server
    ├── app.js                  # Express app setup, routes, error handling
    ├── config/
    │   ├── database.js         # Sequelize connection config
    │   ├── seed.js             # Seed data (users + products)
    │   └── sync.js             # Database sync utility
    ├── controllers/
    │   ├── authController.js   # Register, login, profile (with transactions)
    │   ├── productController.js# Product CRUD, search, stock management
    │   ├── cartController.js   # Cart add, update, remove, clear
    │   └── orderController.js  # Orders, cancellation, payment (with transactions)
    ├── middlewares/
    │   ├── auth.js             # JWT Bearer token verification
    │   ├── authorize.js        # Role-based access control factory
    │   ├── errorHandler.js     # Global error handler (Sequelize + generic)
    │   └── validate.js         # express-validator result checker
    ├── models/
    │   ├── index.js            # Model registry and all associations
    │   ├── User.js             # User model (bcrypt hooks, toJSON)
    │   ├── Product.js          # Product model
    │   ├── Cart.js             # Cart model (1:1 with User)
    │   ├── CartItem.js         # CartItem model
    │   ├── Order.js            # Order model (status + payment enums)
    │   └── OrderItem.js        # OrderItem model (price snapshot)
    ├── routes/
    │   ├── authRoutes.js       # /api/auth/*
    │   ├── productRoutes.js    # /api/products/*
    │   ├── cartRoutes.js       # /api/cart/*
    │   └── orderRoutes.js      # /api/orders/*
    └── validators/
        ├── authValidator.js    # Registration & login validation
        ├── productValidator.js # Product creation & update validation
        ├── cartValidator.js    # Cart item validation
        └── orderValidator.js   # Order & payment validation
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server (production) |
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm run seed` | Seed database with sample data |
| `npm run db:sync` | Sync/create all database tables |

---

## HTTP Status Codes Used

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful read/update |
| `201` | Created | User registered, product created, order placed |
| `400` | Bad Request | Validation error, empty cart, insufficient stock |
| `401` | Unauthorized | Missing/invalid/expired JWT token |
| `402` | Payment Required | Payment simulation failed |
| `403` | Forbidden | Wrong role (e.g., customer trying admin action) |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate email on registration |
| `429` | Too Many Requests | Daily cancellation limit reached |
| `500` | Internal Server Error | Unexpected server error |

---

## Author

**Mahir Faysal**
- GitHub: [@Mahir-Faysal](https://github.com/Mahir-Faysal)
