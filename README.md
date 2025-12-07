# KoolITs POS System - React

A modern, full-featured Point of Sale (POS) system for KoolITs, built with React and ready for Vercel deployment.

## Features

### 🛍️ POS (Staff)
- Product browsing by category (Lemonade, Waffle, Fries, Soft Ice Cream)
- Product search functionality
- Cart management with add/remove items
- Size selection and toppings
- Multiple payment methods (Cash, Card, GCash, PayMaya)
- Order history view
- Real-time sales tracking

### 👨‍💼 Admin Panel
- Product management (CRUD operations)
- Multi-size product support
- Toppings management
- Inventory tracking
- User management (Create/Edit staff accounts)
- Sales dashboard with analytics
- Daily/Weekly/Monthly sales reports
- Stock movement tracking

### 📊 Dashboard
- Real-time sales overview
- Best-selling products
- Sales trends charts
- Category performance
- Low stock alerts
- Recent orders list

## Tech Stack

- **Frontend:** React 18 + Vite
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React + Font Awesome
- **Styling:** Pure CSS (Custom)
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account (already configured)
- Backend API running at: `https://backend-vert-delta-99.vercel.app/api`

## Installation

1. **Clone or download this project**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment to Vercel

### Method 1: Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```
   Follow the prompts to deploy.

### Method 2: Using Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"

## Default Login Credentials

### Admin Account
- Username: `admin`
- Password: `admin123`

**Note:** Make sure to run `POST /api/auth/setup` on the backend first to create the admin account.

## Project Structure

```
koolits-pos-react/
├── public/
│   └── koolits-logo.png        # Logo image
├── src/
│   ├── components/             # Reusable components
│   │   ├── Layout.jsx         # Main layout wrapper
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── ...
│   ├── pages/                  # Page components
│   │   ├── Login.jsx          # Login page
│   │   ├── POS.jsx            # POS interface
│   │   ├── AdminPanel.jsx     # Admin panel
│   │   ├── Dashboard.jsx      # Analytics dashboard
│   │   └── UserManagement.jsx # User management
│   ├── services/               # API services
│   │   └── api.js             # Axios configuration
│   ├── utils/                  # Utility functions
│   │   ├── auth.js            # Authentication helpers
│   │   └── helpers.js         # General helpers
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── vite.config.js
└── vercel.json                 # Vercel configuration
```

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/setup` - Create admin account
- `GET /api/auth/users` - Get all users (Admin)
- `POST /api/auth/users` - Create user (Admin)
- `PUT /api/auth/users/:id` - Update user (Admin)

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/reports/daily-sales` - Get daily sales
- `GET /api/reports/sales` - Get sales report (Admin)

### Inventory
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory
- `POST /api/inventory/:id/restock` - Restock item
- `GET /api/inventory/alerts/summary` - Get low stock alerts

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/sales-trends` - Get sales trends

## Features Breakdown

### POS Interface
- Clean, intuitive design optimized for touchscreens
- Category-based product filtering
- Real-time cart calculation with tax
- Product customization (sizes, toppings)
- Order completion with multiple payment options
- Print receipt (optional)

### Admin Panel
- Full product lifecycle management
- Recipe management for inventory tracking
- Bulk operations support
- Advanced filtering and search

### User Management
- Role-based access control (Admin/Staff)
- Password reset functionality
- User activity tracking
- Account status management

### Dashboard Analytics
- Sales performance metrics
- Product performance analysis
- Time-based sales trends
- Visual charts and graphs

## Environment Variables

Create a `.env` file if you need to override the API URL:

```env
VITE_API_URL=https://backend-vert-delta-99.vercel.app/api
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- Code splitting with dynamic imports
- Lazy loading for routes
- Optimized bundle size
- Image optimization
- Caching strategies

## Security Features

- JWT token authentication
- Protected routes
- Role-based access control
- XSS protection
- CORS enabled
- Secure localStorage usage

## Troubleshooting

### Port already in use
```bash
# Kill the process using port 3000
npx kill-port 3000
# Or specify a different port
npm run dev -- --port 3001
```

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API connection issues
- Verify the backend is running at `https://backend-vert-delta-99.vercel.app/api`
- Check CORS settings on the backend
- Verify authentication tokens are being sent

## Support

For issues or questions:
1. Check the console for error messages
2. Verify API endpoints are accessible
3. Ensure MongoDB connection is active
4. Check authentication tokens

## License

Proprietary - KoolITs POS System

## Credits

Developed for KoolITs
Built with ❤️ using React + Vite
# koolits
