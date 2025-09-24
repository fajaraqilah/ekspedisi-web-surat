# Vercel Deployment Guide

This project is now configured for seamless deployment to Vercel as a static website.

## Configuration Overview

### 1. Project Structure
Your project now uses a `public/` folder structure that Vercel recognizes:
```
ekspedisi-web/
├── public/                 # Vercel output directory
│   ├── index.html          # Root page (automatically served at /)
│   ├── admin.html          # Available at /admin
│   ├── dashboard.html      # Available at /dashboard
│   ├── login.html          # Available at /login
│   ├── reset-password.html # Available at /reset-password
│   ├── user-dspi-dashboard.html # Available at /user-dspi-dashboard
│   ├── dspi-dashboard.html # Available at /dspi-dashboard
│   ├── 404.html           # Custom 404 page
│   ├── assets/            # Static assets (CSS, JS)
│   ├── config/            # Configuration files
│   └── frontend/          # Frontend JS files
├── scripts/               # Build scripts
├── vercel.json            # Vercel deployment configuration
└── package.json           # Updated build scripts
```

### 2. Key Configuration Files

#### `vercel.json`
- Configures Vercel to treat your project as a static website
- Sets output directory to `public/` folder
- Sets up clean URL routing (no .html extensions needed)
- Adds security headers
- Enables asset caching
- Configures environment variable support

#### `package.json` (Updated)
- Added `vercel-build` script for proper build process
- Generates optimized Tailwind CSS
- Handles environment variable injection

### 3. Environment Variables (Secure)
Your Supabase credentials are handled securely:
- Development: Uses local configuration
- Production: Uses Vercel environment variables
- Fallback: Uses safe defaults if variables aren't set

## Deployment Steps

### Step 1: Push to Git Repository
```bash
git add .
git commit -m "Configure project for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables:
   ```bash
   vercel env add SUPABASE_URL production
   vercel env add SUPABASE_ANON_KEY production
   ```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Vercel will automatically detect the configuration
4. Add environment variables in the dashboard:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Step 3: Configure Environment Variables
In your Vercel dashboard, add these environment variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | Production |
| `SUPABASE_ANON_KEY` | `your-anon-key` | Production |

### Step 4: Verify Deployment
1. Check that your site loads at the Vercel URL
2. Test all pages:
   - `/` (index.html)
   - `/admin` (admin.html)
   - `/dashboard` (dashboard.html)
   - `/login` (login.html)
   - etc.
3. Verify Supabase integration works
4. Test responsive design and all features

## Features Enabled

### ✅ Clean URLs
- Access pages without `.html` extension
- `/admin` instead of `/admin.html`
- `/dashboard` instead of `/dashboard.html`

### ✅ Security Headers
- Content Security Policy
- XSS Protection
- Frame Options
- Referrer Policy

### ✅ Asset Optimization
- CSS minification via Tailwind
- Asset caching for performance
- Gzip compression

### ✅ Environment Security
- Environment variables are injected securely
- No sensitive data in client-side code
- Fallback configuration for safety

### ✅ Error Handling
- Custom 404 page
- Proper error routing
- Graceful fallbacks

## Troubleshooting

### Build Errors
If you encounter build errors:
1. Check that all dependencies are installed: `npm install`
2. Verify Tailwind CSS builds locally: `npm run build-css-prod`
3. Check Vercel build logs for specific errors

### Environment Variable Issues
If Supabase integration fails:
1. Verify environment variables are set in Vercel dashboard
2. Check browser console for configuration errors
3. Ensure Supabase URL and key are correct

### Routing Issues
If pages don't load correctly:
1. Check `vercel.json` routing configuration
2. Verify all HTML files exist in root directory
3. Test routes in Vercel preview deployment

## Local Development
Continue using your existing development workflow:
```bash
npm run dev          # Development with Tailwind watch
npm run build        # Production build
npm run serve        # Local server
```

## Production URLs
After deployment, your site will be available at:
- Main site: `https://your-project.vercel.app`
- Admin: `https://your-project.vercel.app/admin`
- Dashboard: `https://your-project.vercel.app/dashboard`
- etc.

## Security Notes
- Environment variables are handled securely
- No sensitive data is exposed in client-side code
- Security headers are automatically applied
- HTTPS is enforced by default

Your project is now ready for Vercel deployment! 🚀