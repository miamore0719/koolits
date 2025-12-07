# KoolITs POS - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies

```bash
cd koolits-pos-react
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Login

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Make sure the backend API is running and has the admin account created via:
```bash
POST https://backend-vert-delta-99.vercel.app/api/auth/setup
```

### 4. Navigate the System

**For Admin:**
- Dashboard - View sales analytics
- Products - Manage menu items
- Users - Manage staff accounts
- POS - Process orders

**For Staff:**
- POS - Process customer orders
- View order history

## 📦 What's Included

```
koolits-pos-react/
├── public/
│   └── koolits-logo.png          # App logo
├── src/
│   ├── components/
│   │   ├── Layout.jsx             # Main layout wrapper
│   │   └── ProtectedRoute.jsx    # Route protection
│   ├── pages/
│   │   ├── Login.jsx              # Login page
│   │   ├── POS.jsx                # POS interface (staff & admin)
│   │   ├── AdminPanel.jsx         # Product management (admin)
│   │   ├── Dashboard.jsx          # Sales dashboard (admin)
│   │   └── UserManagement.jsx    # User management (admin)
│   ├── services/
│   │   └── api.js                 # API service with axios
│   ├── utils/
│   │   ├── auth.js                # Authentication utilities
│   │   └── helpers.js             # Helper functions
│   ├── styles/
│   │   ├── Login.css
│   │   ├── POS.css
│   │   ├── Admin.css
│   │   └── Dashboard.css
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── index.html
├── package.json
├── vite.config.js
├── vercel.json                    # Vercel configuration
├── README.md                      # Full documentation
├── DEPLOYMENT.md                  # Deployment guide
└── QUICKSTART.md                  # This file
```

## 🎯 Key Features

### POS System
- ✅ Category-based product browsing
- ✅ Product search
- ✅ Size and topping selection
- ✅ Shopping cart management
- ✅ Multiple payment methods
- ✅ Receipt printing
- ✅ Order history

### Admin Panel
- ✅ Full CRUD for products
- ✅ Multi-size product support
- ✅ Toppings management
- ✅ Product status control
- ✅ Category filtering

### Dashboard
- ✅ Sales overview
- ✅ Real-time statistics
- ✅ Recent orders
- ✅ Best sellers
- ✅ Performance metrics

### User Management
- ✅ Create/edit staff accounts
- ✅ Role assignment (Admin/Staff)
- ✅ Status management
- ✅ Password management

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Deployment
vercel                   # Deploy to Vercel
vercel --prod            # Deploy to production

# Maintenance
npm install              # Install dependencies
npm update               # Update dependencies
```

## 🌐 API Configuration

The app connects to:
```
https://backend-vert-delta-99.vercel.app/api
```

To change the API URL, create a `.env` file:
```env
VITE_API_URL=https://your-api-url.com/api
```

## 📱 Responsive Design

The app works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile devices
- ✅ Touch screens

## 🔐 Security

- JWT token authentication
- Protected routes
- Role-based access control
- Secure password handling
- HTTPS enforced (on Vercel)

## 🐛 Troubleshooting

### Cannot Login
1. Check if backend is running
2. Verify admin account exists
3. Check browser console for errors
4. Try clearing localStorage

### Products Not Loading
1. Verify API connection
2. Check authentication token
3. Verify products exist in database

### Build Errors
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Run `npm run build`

## 📞 Getting Help

1. Check `README.md` for full documentation
2. Check `DEPLOYMENT.md` for deployment issues
3. Review browser console for errors
4. Check Network tab for API failures

## 🎨 Customization

### Change Colors
Edit `src/index.css`:
```css
:root {
  --primary: #2f4858;      /* Main brand color */
  --secondary: #e89b3c;    /* Accent color */
  --success: #22c55e;      /* Success color */
  --danger: #ef4444;       /* Error color */
}
```

### Change Logo
Replace `public/koolits-logo.png` with your logo

### Add Features
All components are in `src/pages/` and `src/components/`

## ✅ Production Checklist

Before deploying to production:

- [ ] Test all features locally
- [ ] Verify API connection
- [ ] Check responsive design
- [ ] Test on different browsers
- [ ] Review security settings
- [ ] Configure custom domain
- [ ] Set up error tracking
- [ ] Enable analytics

## 🚀 Deploy Now!

Ready to deploy? Follow the `DEPLOYMENT.md` guide or:

```bash
# Quick deploy to Vercel
vercel
```

---

**Need Help?** Check the full `README.md` for detailed information!
