# 🧪 API Testing Guide - Mini E-Commerce API

## What is an API?

Think of an API like a **waiter in a restaurant**:
- You (the client/frontend) tell the waiter what you want
- The waiter (API) goes to the kitchen (database) and brings back your food (data)
- You don't need to go to the kitchen yourself!

Since we don't have a frontend, we use **tools** to play the role of the customer and talk directly to the waiter.

---

## 🔧 Tool: Thunder Client (already installed in your VS Code!)

1. Look at the **left sidebar** in VS Code
2. Click the **⚡ thunder bolt icon**
3. Click **"New Request"**
4. You'll see a screen where you can:
   - Choose a **method** (GET, POST, PUT, DELETE)
   - Type a **URL**
   - Add **headers** and **body**
   - Click **Send** and see the response!

---

## 🚀 Before Testing: Start the Server!

Open a terminal in VS Code (`Ctrl + ~`) and run:
```
cd c:\Projects\AppifyDevs
node src/server.js
```
Keep this terminal **open** (don't close it).

---

## 📝 Step-by-Step API Testing Walkthrough

### ──────────────────────────────────
### STEP 1: Register a New User
### ──────────────────────────────────

This is like **signing up** on a website.

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/register`
- **Go to "Body" tab → select "JSON" → paste this:**

```json
{
  "name": "Mahir",
  "email": "mahir@test.com",
  "password": "password123"
}
```

- Click **Send**

✅ **Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 3,
      "name": "Mahir",
      "email": "mahir@test.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

🔑 **IMPORTANT:** Copy the `token` value! You'll need it for all the next steps.

---

### ──────────────────────────────────
### STEP 2: Login (Get a Token)
### ──────────────────────────────────

This is like **logging in** to your account. You can also use the pre-made accounts:

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/auth/login`
- **Body (JSON):**

```json
{
  "email": "customer@ecommerce.com",
  "password": "customer123"
}
```

✅ **Response gives you a `token`** — this is your "ID card" that proves who you are.

💡 **What is a Token?**
When you log in to Instagram, it remembers you so you don't log in every time.
A token does the same thing — it's proof that you're logged in.

---

### ──────────────────────────────────
### STEP 3: How to Use the Token (Authentication)
### ──────────────────────────────────

For any request that requires login, you need to add the token:

1. Go to the **"Headers"** tab (or "Auth" tab)
2. Add a header:
   - **Key:** `Authorization`
   - **Value:** `Bearer <paste-your-token-here>`

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6...
```

---

### ──────────────────────────────────
### STEP 4: Browse Products (No login needed!)
### ──────────────────────────────────

This is like **browsing a store** — anyone can look at products.

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/products`
- **No body needed, no token needed**
- Click **Send**

✅ You'll see all 8 products we seeded earlier!

**Try these variations:**

| What you want | URL |
|---------------|-----|
| Page 2 | `http://localhost:3000/api/products?page=2` |
| Only 3 per page | `http://localhost:3000/api/products?limit=3` |
| Search for "keyboard" | `http://localhost:3000/api/products?search=keyboard` |
| Under $30 | `http://localhost:3000/api/products?maxPrice=30` |
| Sort by price (low→high) | `http://localhost:3000/api/products?sortBy=price&order=ASC` |

---

### ──────────────────────────────────
### STEP 5: View a Single Product
### ──────────────────────────────────

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/products/1`

This gets product with ID 1.

---

### ──────────────────────────────────
### STEP 6: Add Items to Cart 🛒
### ──────────────────────────────────

You need to be **logged in as a customer** for this.

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/cart/items`
- **Headers:** `Authorization: Bearer <your-customer-token>`
- **Body (JSON):**

```json
{
  "productId": 1,
  "quantity": 2
}
```

✅ This adds 2 units of product #1 to your cart.

Try adding more products:
```json
{
  "productId": 3,
  "quantity": 1
}
```

---

### ──────────────────────────────────
### STEP 7: View Your Cart
### ──────────────────────────────────

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/cart`
- **Headers:** `Authorization: Bearer <your-customer-token>`

✅ You'll see all items in your cart with product details!

---

### ──────────────────────────────────
### STEP 8: Place an Order 📦
### ──────────────────────────────────

This converts your cart into an order (like clicking "Checkout").

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/orders`
- **Headers:** `Authorization: Bearer <your-customer-token>`
- **Body (JSON):**

```json
{
  "shippingAddress": "123 Main Street, Dhaka, Bangladesh"
}
```

✅ Response shows your order with:
- Total amount (auto-calculated!)
- Status: "pending"
- Payment status: "unpaid"
- Each item with price snapshot

🎯 **Behind the scenes:** The API checks stock, calculates totals, deducts stock, and clears your cart — all in one transaction!

---

### ──────────────────────────────────
### STEP 9: Pay for Your Order 💳
### ──────────────────────────────────

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/orders/1/pay`  (replace 1 with your order ID)
- **Headers:** `Authorization: Bearer <your-customer-token>`
- **Body (JSON):**

```json
{
  "paymentMethod": "credit_card"
}
```

Other payment methods: `debit_card`, `mobile_banking`, `cash_on_delivery`

⚠️ **Note:** Payment has a simulated 90% success rate — it might "fail" randomly!

---

### ──────────────────────────────────
### STEP 10: View Your Orders
### ──────────────────────────────────

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/orders`
- **Headers:** `Authorization: Bearer <your-customer-token>`

---

### ──────────────────────────────────
### STEP 11: Cancel an Order ❌
### ──────────────────────────────────

- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/orders/1/cancel`
- **Headers:** `Authorization: Bearer <your-customer-token>`

⚠️ **Fraud Prevention:** You can only cancel 3 orders per day!

---

### ──────────────────────────────────
### STEP 12: Admin Features 👑
### ──────────────────────────────────

Login as admin first:
- **Email:** `admin@ecommerce.com`
- **Password:** `admin123`

**Create a new product:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/products`
- **Headers:** `Authorization: Bearer <your-admin-token>`
- **Body (JSON):**

```json
{
  "name": "Gaming Mouse Pad",
  "description": "Extra large RGB mouse pad",
  "price": 25.99,
  "stock": 50,
  "imageUrl": "https://example.com/mousepad.jpg"
}
```

**Update order status (admin only):**
- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/orders/1/status`
- **Headers:** `Authorization: Bearer <your-admin-token>`
- **Body (JSON):**

```json
{
  "status": "confirmed"
}
```

Valid status flow: `pending` → `confirmed` → `shipped` → `delivered`

---

## 🧠 Understanding the Assignment

Here's what the project demonstrates:

### 1. **Authentication & Authorization**
- Users register and login → receive a JWT token
- Token must be sent with every protected request
- **Roles:** Admin can manage products/orders, Customer can only shop

### 2. **Product Management (CRUD)**
- **C**reate → `POST /api/products` (admin)
- **R**ead → `GET /api/products` (everyone)
- **U**pdate → `PUT /api/products/:id` (admin)
- **D**elete → `DELETE /api/products/:id` (admin)

### 3. **Cart System**
- Each customer has ONE cart
- Add items, update quantities, remove items
- Cart is cleared when an order is placed

### 4. **Order System with Transactions**
- Placing an order is an "atomic operation" — if anything fails, nothing changes
- Stock is checked and deducted safely (even with concurrent requests!)
- Price is "snapshotted" at purchase time (if price changes later, your order keeps the old price)

### 5. **Bonus Features**
- 🔍 **Search & Filter** — search products, filter by price, paginate
- 🛡️ **Fraud Prevention** — max 3 cancellations per day per user
- 💳 **Payment Simulation** — simulated payment with 90% success rate
- 🔒 **Stock Locking** — row-level database locks prevent overselling

---

## 📌 Quick Reference: All Endpoints

| Method | URL | Auth | What it does |
|--------|-----|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Sign up |
| `POST` | `/api/auth/login` | ❌ | Log in, get token |
| `GET` | `/api/auth/profile` | 🔒 | View your profile |
| `GET` | `/api/products` | ❌ | List all products |
| `GET` | `/api/products/:id` | ❌ | View one product |
| `POST` | `/api/products` | 🔒👑 | Create product (admin) |
| `PUT` | `/api/products/:id` | 🔒👑 | Update product (admin) |
| `DELETE` | `/api/products/:id` | 🔒👑 | Delete product (admin) |
| `PATCH` | `/api/products/:id/stock` | 🔒👑 | Update stock (admin) |
| `GET` | `/api/cart` | 🔒🛒 | View your cart |
| `POST` | `/api/cart/items` | 🔒🛒 | Add to cart |
| `PUT` | `/api/cart/items/:id` | 🔒🛒 | Change quantity |
| `DELETE` | `/api/cart/items/:id` | 🔒🛒 | Remove from cart |
| `DELETE` | `/api/cart` | 🔒🛒 | Clear entire cart |
| `POST` | `/api/orders` | 🔒🛒 | Place order (checkout) |
| `GET` | `/api/orders` | 🔒 | View your orders |
| `GET` | `/api/orders/:id` | 🔒 | View one order |
| `PUT` | `/api/orders/:id/cancel` | 🔒 | Cancel order |
| `PUT` | `/api/orders/:id/status` | 🔒👑 | Update status (admin) |
| `POST` | `/api/orders/:id/pay` | 🔒 | Simulate payment |

🔒 = Login required | 👑 = Admin only | 🛒 = Customer only

---

## 🎯 Suggested Testing Flow

Follow this order to test the full "shopping experience":

1. ✅ **Login** as customer → save the token
2. ✅ **Browse products** → see what's available
3. ✅ **Add 2-3 items** to cart
4. ✅ **View cart** → see your items
5. ✅ **Place order** → checkout!
6. ✅ **Pay for order** → simulate payment
7. ✅ **View orders** → check status
8. ✅ **Login as admin** → save admin token
9. ✅ **Update order status** → confirmed → shipped → delivered
10. ✅ **Create a new product** as admin
