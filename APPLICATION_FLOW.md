# KoolITs POS - Application Flow Diagram

## 🔄 User Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Start Application                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                     Login Page                               │
│  • Enter username & password                                 │
│  • Authentication via JWT                                    │
└────────────┬────────────────────────┬────────────────────────┘
             │                        │
        Admin Role                Staff Role
             │                        │
             ▼                        ▼
┌──────────────────────┐   ┌──────────────────────┐
│   Admin Dashboard    │   │    POS Interface     │
└──────────┬───────────┘   └──────────────────────┘
           │
           ├── Dashboard (Analytics)
           ├── Products (Manage)
           ├── Users (Manage)
           └── POS (Process Orders)
```

## 📊 Authentication Flow

```
User Input              Frontend                Backend
   │                       │                      │
   │  Username/Password    │                      │
   ├──────────────────────>│                      │
   │                       │   POST /auth/login   │
   │                       ├─────────────────────>│
   │                       │                      │
   │                       │  Validate Credentials│
   │                       │      & Generate JWT  │
   │                       │                      │
   │                       │   Return Token +     │
   │                       │   User Data          │
   │                       │<─────────────────────┤
   │                       │                      │
   │  Store Token +        │                      │
   │  User in localStorage │                      │
   │<──────────────────────┤                      │
   │                       │                      │
   │  Redirect to          │                      │
   │  Appropriate Page     │                      │
   │<──────────────────────┤                      │
   │                       │                      │
```

## 🛒 Order Processing Flow

```
┌────────────────────────────────────────────────────────────┐
│ 1. Browse Products                                          │
│    • Filter by category                                     │
│    • Search products                                        │
│    • View product details                                   │
└────────────┬───────────────────────────────────────────────┘
             ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Select Product                                           │
│    • Choose size                                            │
│    • Add toppings (optional)                                │
│    • Set quantity                                           │
│    • Add to cart                                            │
└────────────┬───────────────────────────────────────────────┘
             ▼
┌────────────────────────────────────────────────────────────┐
│ 3. Review Cart                                              │
│    • View all items                                         │
│    • Modify quantities                                      │
│    • Remove items                                           │
│    • See total price                                        │
└────────────┬───────────────────────────────────────────────┘
             ▼
┌────────────────────────────────────────────────────────────┐
│ 4. Checkout                                                 │
│    • Select payment method                                  │
│    • Enter amount (cash only)                               │
│    • Calculate change                                       │
│    • Confirm payment                                        │
└────────────┬───────────────────────────────────────────────┘
             ▼
┌────────────────────────────────────────────────────────────┐
│ 5. Complete Order                                           │
│    • Process payment                                        │
│    • Update inventory                                       │
│    • Generate order number                                  │
│    • Print receipt (optional)                               │
│    • Clear cart                                             │
└────────────────────────────────────────────────────────────┘
```

## 📦 Product Management Flow

```
Admin Dashboard
      │
      ├─> View Products List
      │    │
      │    ├─> Filter by Category
      │    ├─> Search Products
      │    └─> View Details
      │
      ├─> Add New Product
      │    │
      │    ├─> Enter Basic Info
      │    │    • Name
      │    │    • Category
      │    │    • Flavor
      │    │    • Description
      │    │
      │    ├─> Define Sizes & Prices
      │    │    • Small: ₱XX
      │    │    • Medium: ₱XX
      │    │    • Large: ₱XX
      │    │
      │    ├─> Add Toppings (Optional)
      │    │    • Topping 1: ₱XX
      │    │    • Topping 2: ₱XX
      │    │
      │    └─> Save Product
      │         └─> POST /api/products
      │
      ├─> Edit Product
      │    │
      │    ├─> Load Product Data
      │    ├─> Modify Fields
      │    └─> Save Changes
      │         └─> PUT /api/products/:id
      │
      └─> Delete Product
           │
           ├─> Confirm Deletion
           └─> Remove from Database
                └─> DELETE /api/products/:id
```

## 👥 User Management Flow

```
Admin Panel
      │
      ├─> View All Users
      │    └─> Display User Table
      │         • Full Name
      │         • Username
      │         • Role
      │         • Status
      │         • Actions
      │
      ├─> Add New User
      │    │
      │    ├─> Enter User Details
      │    │    • Full Name
      │    │    • Username
      │    │    • Password
      │    │    • Role (Admin/Staff)
      │    │    • Email (optional)
      │    │    • Phone (optional)
      │    │
      │    └─> Save User
      │         └─> POST /api/auth/users
      │
      ├─> Edit User
      │    │
      │    ├─> Load User Data
      │    ├─> Modify Fields
      │    │    (Password optional)
      │    │
      │    └─> Update User
      │         └─> PUT /api/auth/users/:id
      │
      └─> Toggle User Status
           │
           ├─> Confirm Action
           └─> Update Status
                └─> PUT /api/auth/users/:id
                     { status: 'active'/'inactive' }
```

## 📊 Dashboard Data Flow

```
Dashboard Page Load
         │
         ├─> Fetch Overview Data
         │    └─> GET /api/dashboard/overview
         │         • Today's Sales
         │         • Total Orders
         │         • Total Products
         │         • Average Order Value
         │         • Best Sellers
         │
         ├─> Fetch Recent Orders
         │    └─> GET /api/orders
         │         ?limit=10
         │         &sort=-orderDate
         │
         ├─> Display Stats Cards
         │    • Sales Card
         │    • Orders Card
         │    • Products Card
         │    • Average Card
         │
         ├─> Display Recent Orders Table
         │    • Order Number
         │    • Date & Time
         │    • Items Count
         │    • Total Amount
         │    • Payment Method
         │    • Status
         │
         └─> Display Best Sellers
              • Product Name
              • Units Sold
              • Total Revenue
```

## 🔐 Protected Route Flow

```
User Navigates to Route
         │
         ▼
    Check Authentication
         │
         ├─> No Token?
         │    └─> Redirect to Login
         │
         └─> Has Token?
              │
              ├─> Check Required Role
              │    │
              │    ├─> Admin Route?
              │    │    │
              │    │    ├─> Is Admin?
              │    │    │    └─> Allow Access
              │    │    │
              │    │    └─> Not Admin?
              │    │         └─> Redirect to POS
              │    │
              │    └─> Staff Route?
              │         └─> Allow Access
              │
              └─> Render Protected Content
```

## 🌐 API Request Flow

```
Frontend Component
       │
       ├─> Import API Service
       │    import { productAPI } from '@/services/api'
       │
       ├─> Make API Call
       │    productAPI.getAll()
       │
       ▼
   Axios Instance
       │
       ├─> Add Authorization Header
       │    headers: { Authorization: `Bearer ${token}` }
       │
       ├─> Send Request
       │    GET https://backend.../api/products
       │
       ▼
   Backend API
       │
       ├─> Verify JWT Token
       ├─> Check Permissions
       ├─> Process Request
       ├─> Query Database
       │
       └─> Return Response
            │
            ▼
   Axios Interceptor
       │
       ├─> Check Status Code
       │    │
       │    ├─> 200: Success
       │    │    └─> Return Data
       │    │
       │    ├─> 401/403: Unauthorized
       │    │    └─> Logout User
       │    │
       │    └─> Other: Error
       │         └─> Reject Promise
       │
       ▼
   Frontend Component
       │
       ├─> Update State
       ├─> Render UI
       └─> Handle Errors
```

## 🎨 Component Hierarchy

```
App.jsx
  │
  ├─> Router
       │
       ├─> Public Routes
       │    └─> Login
       │
       └─> Protected Routes
            │
            ├─> Layout Wrapper
            │    │
            │    ├─> Header
            │    │    • Logo
            │    │    • Navigation
            │    │    • User Info
            │    │    • Logout
            │    │
            │    ├─> Main Content
            │    │    │
            │    │    ├─> POS Page
            │    │    │    • Products Section
            │    │    │    • Cart Section
            │    │    │    • Modals
            │    │    │
            │    │    ├─> Admin Panel
            │    │    │    • Products Table
            │    │    │    • Add/Edit Modal
            │    │    │
            │    │    ├─> Dashboard
            │    │    │    • Stats Cards
            │    │    │    • Orders Table
            │    │    │    • Best Sellers
            │    │    │
            │    │    └─> User Management
            │    │         • Users Table
            │    │         • Add/Edit Modal
            │    │
            │    └─> Footer
            │
            └─> ProtectedRoute
                 • Auth Check
                 • Role Check
                 • Redirect Logic
```

## 📱 State Management Flow

```
Component State (useState)
         │
         ├─> User Actions
         │    • Click
         │    • Input
         │    • Submit
         │
         ├─> Update State
         │    setProducts([...])
         │    setCart([...])
         │    setLoading(true)
         │
         ├─> Trigger Re-render
         │
         └─> Update UI
              • Show Loading
              • Display Data
              • Show Errors
```

## 🔄 Cart Update Flow

```
User Adds Item to Cart
         │
         ▼
  Calculate Item Price
    • Base Price (size)
    • + Toppings Price
    • × Quantity
    • = Subtotal
         │
         ▼
  Update Cart State
    setCart([...cart, newItem])
         │
         ▼
  Recalculate Cart Total
    cart.reduce((sum, item) =>
      sum + item.subtotal, 0)
         │
         ▼
  Update UI
    • Cart Items List
    • Total Price
    • Item Count Badge
```

## 🎯 Build & Deploy Flow

```
Local Development
       │
       ├─> Write Code
       ├─> Test Locally
       │    npm run dev
       │
       └─> Commit to Git
            git commit -m "..."
                 │
                 ▼
            Push to GitHub
            git push origin main
                 │
                 ▼
            Vercel Webhook
                 │
                 ├─> Clone Repository
                 ├─> Install Dependencies
                 │    npm install
                 │
                 ├─> Build Application
                 │    npm run build
                 │    • Vite bundles code
                 │    • Optimizes assets
                 │    • Generates dist/
                 │
                 ├─> Deploy to CDN
                 │    • Upload static files
                 │    • Configure routing
                 │    • Set up caching
                 │
                 └─> Deployment Complete!
                      https://your-app.vercel.app
```

---

## 📝 Notes

- All flows are automatic and optimized for performance
- Error handling at each step
- Loading states for better UX
- Security checks at every layer
- Responsive design throughout

**For detailed implementation, see the source code!**
