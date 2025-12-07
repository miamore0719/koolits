# KoolITs POS - Vercel Deployment Guide

## Prerequisites

- GitHub account (or GitLab/Bitbucket)
- Vercel account (free tier is sufficient)
- Git installed on your computer

## Step 1: Prepare Your Code

1. Make sure all files are in the `koolits-pos-react` directory
2. Verify the `.gitignore` file exists
3. Check that `package.json` and `vite.config.js` are properly configured

## Step 2: Initialize Git Repository

```bash
cd koolits-pos-react

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - KoolITs POS React app"
```

## Step 3: Push to GitHub

### Option A: Create New Repository on GitHub

1. Go to https://github.com/new
2. Name your repository (e.g., "koolits-pos-react")
3. DO NOT initialize with README, .gitignore, or license
4. Click "Create repository"

### Option B: Use Git Commands

```bash
# Replace YOUR_USERNAME and YOUR_REPO with your actual GitHub details
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/
2. Sign up or log in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. Add Environment Variable (optional):
   - Name: `VITE_API_URL`
   - Value: `https://backend-vert-delta-99.vercel.app/api`
7. Click "Deploy"

### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? koolits-pos-react
# - In which directory is your code located? ./
# - Want to override the settings? No

# Deploy to production
vercel --prod
```

## Step 5: Post-Deployment

After deployment, Vercel will provide you with a URL like:
- `https://koolits-pos-react.vercel.app`
- `https://koolits-pos-react-yourusername.vercel.app`

### Test Your Deployment

1. Visit the URL
2. You should see the login page
3. Test login with:
   - Username: `admin`
   - Password: `admin123`
   - (Ensure the backend has the admin account created via `/api/auth/setup`)

## Step 6: Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (usually a few minutes)

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Solution: Make sure `package.json` includes all dependencies
- Run `npm install` locally first to verify

**Error: "Command 'npm run build' exited with 1"**
- Solution: Check your code for errors
- Run `npm run build` locally to see detailed errors

### Runtime Errors

**Blank page after deployment**
- Check browser console for errors
- Verify API URL is correct
- Check Network tab for failed API calls

**API Connection Issues**
- Verify `VITE_API_URL` environment variable
- Ensure backend is running at: https://backend-vert-delta-99.vercel.app/api
- Check CORS settings on backend

**404 on Page Refresh**
- This is normal for SPAs
- `vercel.json` should handle this automatically
- Verify `vercel.json` is in the root directory

### Cannot Login

1. Verify backend is accessible:
   ```
   https://backend-vert-delta-99.vercel.app/api/health
   ```

2. Check if admin account exists:
   - Send POST request to `/api/auth/setup` to create admin
   - Or create via your backend admin tools

3. Check browser console for errors

4. Verify credentials:
   - Default: admin / admin123

## Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| VITE_API_URL | https://backend-vert-delta-99.vercel.app/api | Backend API URL |

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- View deployment status in Vercel Dashboard

## Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs
```

## Performance Optimization

Your `vite.config.js` already includes:
- Code splitting
- Vendor chunk separation
- Chart library separation

These optimizations reduce initial load time and improve performance.

## Monitoring

1. **Vercel Analytics** (Optional)
   - Enable in Project Settings
   - Track page views and performance

2. **Error Tracking** (Optional)
   - Integrate Sentry or similar service
   - Add in `src/main.jsx`

## Security Checklist

- ✅ Authentication required for all routes
- ✅ Role-based access control
- ✅ Secure token storage in localStorage
- ✅ HTTPS enforced by Vercel
- ⚠️ Consider implementing token expiration
- ⚠️ Consider adding rate limiting on backend

## Support & Resources

- Vercel Documentation: https://vercel.com/docs
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev

## Backup & Version Control

1. Always commit changes before deploying:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

2. Tag important releases:
   ```bash
   git tag -a v1.0.0 -m "Initial release"
   git push --tags
   ```

## Success!

Your KoolITs POS system is now live and accessible worldwide! 🎉

Share the URL with your team and start processing orders.
