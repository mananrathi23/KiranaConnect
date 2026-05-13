# KiranaConnect — Full-Stack B2B Hyperlocal Wholesale Platform

A simplified Udaan for a district. Kirana shop owners place bulk orders from nearby wholesalers. Wholesalers list products with MOQ and tiered pricing. Orders are batched every 6 hours and dispatched together.

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, React Router v6, Axios, Context API, useMemo, Vite |
| Backend   | Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs |
| Caching   | Redis (24h TTL on product catalogue) |
| Scheduling| node-cron (batch dispatch every 6 hours) |

---

## Project Structure

```
kiranaconnect/
├── backend/                 ← Express API server
│   ├── config/db.js
│   ├── models/              ← User, Product, Order, Batch
│   ├── controllers/         ← auth, product, order, batch, analytics
│   ├── routes/              ← all API routes
│   ├── middlewares/         ← JWT auth + role guard
│   ├── jobs/batchJob.js     ← node-cron batch aggregation
│   ├── utils/               ← redisClient, pricingHelper
│   ├── server.js
│   └── .env
└── src/                     ← React frontend
    ├── api/                 ← Axios API modules
    ├── context/             ← AuthContext, CartContext
    ├── pages/               ← 17 pages (wholesaler + kirana + shared)
    ├── components/          ← Navbar, Sidebar, StatusBadge, CountdownTimer
    └── utils/pricingHelper.js
```

---

## Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on port 27017
- **Redis** running locally on port 6379 *(optional — app falls back gracefully if unavailable)*

---

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
# Edit .env if needed (MongoDB URI, JWT secret, Redis URL)
npm run dev        # starts on http://localhost:5000
```

### 2. Frontend

```bash
# from project root
npm install
npm run dev        # starts on http://localhost:5173
```

Vite proxies all `/api` requests to `http://localhost:5000` automatically.

---

## API Endpoints (19 total)

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| PATCH | `/api/auth/profile` | Both roles |

### Products
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/products` | SHOP_OWNER (Redis cached 24h) |
| GET | `/api/products/my` | WHOLESALER |
| GET | `/api/products/:id` | Both |
| POST | `/api/products` | WHOLESALER |
| PATCH | `/api/products/:id` | WHOLESALER |
| PATCH | `/api/products/:id/stock` | WHOLESALER (atomic `$inc`) |
| DELETE | `/api/products/:id` | WHOLESALER |

### Orders
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/orders` | SHOP_OWNER (atomic stock decrement) |
| GET | `/api/orders/my` | SHOP_OWNER (`$lookup` aggregation) |
| GET | `/api/orders/incoming` | WHOLESALER (`$lookup` aggregation) |
| PATCH | `/api/orders/:id/status` | WHOLESALER |

### Batches
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/batches` | WHOLESALER |
| GET | `/api/batches/next-dispatch` | Both |
| PATCH | `/api/batches/:id/dispatch` | WHOLESALER |

### Analytics (WHOLESALER only)
| Method | Route |
|--------|-------|
| GET | `/api/analytics/summary` |
| GET | `/api/analytics/top-products` |
| GET | `/api/analytics/orders-timeline` |
| GET | `/api/analytics/revenue-by-category` |

---

## 6 Core Technical Concepts Implemented

### 1. Order Batching — `node-cron`
- Cron: `0 */6 * * *` — fires every 6 hours via libuv timer I/O
- Groups all PENDING orders by wholesaler → creates Batch doc → updates orders to BATCHED
- **Idempotent**: wholesalers with an open batch in the current 6h window are skipped
- Code: `backend/jobs/batchJob.js`

### 2. Redis Product Catalogue Cache
- `GET /api/products` checks `redis.get('products:all')` first
- Cache hit → instant response; Cache miss → MongoDB query + `setEx(86400, ...)`
- Cache invalidated on any `POST/PATCH/DELETE` product operation
- Code: `backend/controllers/productController.js`, `backend/utils/redisClient.js`

### 3. Avoiding N+1 Queries
- Order history and incoming orders use MongoDB `$lookup` aggregation
- Single DB round trip joins Orders + Users + Products
- Code: `backend/controllers/orderController.js` (`getMyOrders`, `getIncomingOrders`)

### 4. Atomic Stock Decrement
- `findOneAndUpdate({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`
- Returns `null` if stock insufficient → 409 Conflict (anti-oversell guarantee)
- Runs inside a MongoDB session/transaction for multi-item orders
- Code: `backend/controllers/orderController.js` (`placeOrder`)

### 5. Dual-Role JWT Auth
- JWT payload: `{ id, email, role }`
- `authMiddleware` verifies token signature on every protected route
- `roleMiddleware` (`allowRoles('WHOLESALER')`) guards supply-side routes
- Frontend `PrivateRoute` checks token + role; wrong role → redirect
- Code: `backend/middlewares/`, `src/context/AuthContext.jsx`

### 6. useMemo for Cart Totals
- `Cart.jsx`: `const total = useMemo(() => cartItems.reduce(...), [cartItems])`
- Also memoizes per-item tier info (next unlock tier, savings)
- Only recomputes when `cartItems` changes — not on every render cycle
- Code: `src/context/CartContext.jsx`, `src/pages/kirana/Cart.jsx`

---

## User Flows

### Wholesaler
1. Register → `/wholesaler/dashboard`
2. Add products with tier pricing → `/wholesaler/products/add`
3. View incoming orders → accept/reject → `/wholesaler/orders`
4. Monitor batches & dispatch → `/wholesaler/batches`
5. View revenue analytics → `/wholesaler/analytics`
6. Update stock levels → `/wholesaler/stock`

### Kirana Shop Owner
1. Register → `/shop/dashboard`
2. Browse products with tier pricing → `/shop/browse`
3. View product detail with live useMemo price preview
4. Add to cart → place bulk order → `/shop/cart`
5. Track order status timeline → `/shop/orders`
6. Monitor batch dispatch countdown → `/shop/batch-status`
