# Mini E-Commerce API 🛒

A backend RESTful API for a mini e-commerce platform built with Node.js, Express, and PostgreSQL. Features authentication, role-based access control, product management, cart operations, order processing, payment simulation, and fraud prevention.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **PostgreSQL** | Relational database |
| **Sequelize** | ORM for database interaction |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **express-validator** | Input validation |

---

## Setup Instructions

### Prerequisites

- **Node.js** v18+ installed
- **PostgreSQL** installed and running on localhost
- **npm** package manager

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd AppifyDevs
npm install
```

### 2. Configure Environment

Edit the `.env` file in the project root with your PostgreSQL credentials:

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

### 3. Create the Database

Create a PostgreSQL database named `mini_ecommerce`:

```bash
psql -U postgres -c "CREATE DATABASE mini_ecommerce;"
```

### 4. Seed Sample Data

```bash
npm run seed
```

This creates:
- **Admin user:** `admin@ecommerce.com` / `admin123`
- **Customer user:** `customer@ecommerce.com` / `customer123`
- **8 sample products**

### 5. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:3000`

---

## Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Users      │     │   Products   │     │    Carts     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │     │ id (PK)      │     │ id (PK)      │
│ name         │     │ name         │     │ userId (FK)  │───┐
│ email (UQ)   │──┐  │ description  │     │ createdAt    │   │
│ password     │  │  │ price        │     │ updatedAt    │   │
│ role         │  │  │ stock        │     └──────────────┘   │
│ cancellation │  │  │ imageUrl     │                        │
│  Count       │  │  │ createdAt    │     ┌──────────────┐   │
│ lastCancel   │  │  │ updatedAt    │     │  CartItems   │   │
│  lationDate  │  │  └──────────────┘     ├──────────────┤   │
│ createdAt    │  │         │              │ id (PK)      │   │
│ updatedAt    │  │         │              │ cartId (FK)  │───┘
└──────────────┘  │         ├──────────────│ productId(FK)│
                  │         │              │ quantity     │
                  │         │              │ createdAt    │
                  │         │              │ updatedAt    │
                  │         │              └──────────────┘
                  │         │
                  │  ┌──────────────┐     ┌──────────────┐
                  │  │   Orders     │     │  OrderItems  │
                  │  ├──────────────┤     ├──────────────┤
                  └──│ userId (FK)  │     │ id (PK)      │
                     │ id (PK)      │─────│ orderId (FK) │
                     │ totalAmount  │     │ productId(FK)│──
                     │ status       │     │ quantity     │
                     │ paymentStatus│     │ priceAtPurch │
                     │ paymentMethod│     │ createdAt    │
                     │ paidAt       │     │ updatedAt    │
                     │ shippingAddr │     └──────────────┘
                     │ createdAt    │
                     │ updatedAt    │
                     └──────────────┘
```

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and get JWT |
| GET | `/api/auth/profile` | Auth | Get current user profile |

### Products (`/api/products`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | List all products (pagination, search, filter) |
| GET | `/api/products/:id` | Public | Get single product |
| POST | `/api/products` | Admin | Create a product |
| PUT | `/api/products/:id` | Admin | Update a product |
| DELETE | `/api/products/:id` | Admin | Delete a product |
| PATCH | `/api/products/:id/stock` | Admin | Update product stock |

### Cart (`/api/cart`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/cart` | Customer | Get cart with items |
| POST | `/api/cart/items` | Customer | Add item to cart |
| PUT | `/api/cart/items/:itemId` | Customer | Update item quantity |
| DELETE | `/api/cart/items/:itemId` | Customer | Remove item from cart |
| DELETE | `/api/cart` | Customer | Clear entire cart |

### Orders (`/api/orders`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | Customer | Place order from cart |
| GET | `/api/orders` | Auth | List orders (own/all) |
| GET | `/api/orders/:id` | Auth | Get order details |
| POST | `/api/orders/:id/cancel` | Customer | Cancel an order |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |
| POST | `/api/orders/:id/pay` | Customer | Simulate payment |

---

## Key Architectural Decisions

1. **Sequelize ORM** — Used for model definitions, associations, migrations, and database transactions.
2. **Database Transactions** — Order placement uses Sequelize transactions with row-level locking to prevent race conditions and ensure data consistency.
3. **Price Snapshot** — `OrderItem.priceAtPurchase` captures the product price at order time, ensuring order totals remain accurate even if prices change later.
4. **Fraud Prevention** — Users are limited to a configurable number of order cancellations per day to prevent stock-manipulation abuse.
5. **Status Transitions** — Order status updates enforce a valid state machine (e.g., shipped orders can't go back to pending).
6. **Backend-Calculated Totals** — Order totals are always calculated server-side from product prices × quantities.

## Assumptions

- A single Cart per User (1:1 relationship, auto-created at registration).
- Products are listed publicly; no authentication required to browse.
- Admin role can be assigned during registration (for demo purposes — in production, this would be restricted).
- Payment simulation has a 90% success rate to mimic real-world scenarios.
- Stock is deducted only upon successful order placement, and restored on cancellation.

---

## Project Structure

```
AppifyDevs/
├── .env                        # Environment variables
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── server.js               # Entry point — starts server
    ├── app.js                  # Express app setup & route mounting
    ├── config/
    │   ├── database.js         # Sequelize connection config
    │   ├── seed.js             # Seed data script
    │   └── sync.js             # Database sync utility
    ├── controllers/
    │   ├── authController.js   # Auth logic
    │   ├── productController.js# Product CRUD logic
    │   ├── cartController.js   # Cart operations logic
    │   └── orderController.js  # Order & payment logic
    ├── middlewares/
    │   ├── auth.js             # JWT authentication
    │   ├── authorize.js        # Role-based authorization
    │   ├── errorHandler.js     # Global error handler
    │   └── validate.js         # express-validator runner
    ├── models/
    │   ├── index.js            # Model registry & associations
    │   ├── User.js
    │   ├── Product.js
    │   ├── Cart.js
    │   ├── CartItem.js
    │   ├── Order.js
    │   └── OrderItem.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │   ├── cartRoutes.js
    │   └── orderRoutes.js
    └── validators/
        ├── authValidator.js
        ├── productValidator.js
        ├── cartValidator.js
        └── orderValidator.js
```
