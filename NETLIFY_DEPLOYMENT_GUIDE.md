# Netlify Deployment Guide

## Files Created/Updated

✅ Created `netlify.toml` - Netlify configuration file
✅ Updated `vite.config.ts` - Added base path
✅ Updated `.gitignore` - Added .env files to prevent them from being committed

## Next Steps

### 1. Set Environment Variables in Netlify

**IMPORTANT:** Your `.env` file won't be deployed (it's in `.gitignore`), so you MUST add these variables in Netlify:

1. Go to your Netlify site dashboard
2. Click on **Site settings** → **Environment variables**
3. Add these two variables:

**Variable 1:**
- Key: `VITE_SUPABASE_URL`
- Value: `https://cfhtdsqsitnmbgzijtpi.supabase.co`

**Variable 2:**
- Key: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmaHRkc3FzaXRubWJnemlqdHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzEwNzksImV4cCI6MjA3MzUwNzA3OX0.B4v73S0vreX8X9WbfAe_NsueVZvjuGo_5WHuTj-bep0`

### 2. Verify Netlify Build Settings

Go to **Site settings** → **Build & deploy** → **Build settings** and verify:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18 or higher

### 3. Deploy Your Site

**Option A: If connected to Git (recommended)**
```bash
git add .
git commit -m "Add Netlify configuration for deployment"
git push
```
Netlify will automatically deploy when you push.

**Option B: Manual deployment**
1. Build your project locally: `npm run build`
2. Drag and drop the `dist` folder to Netlify

### 4. Test Your Deployment

After deployment:
1. Visit your Netlify site URL
2. Check that all pages load correctly
3. Test navigation between pages
4. Verify that Supabase connection works

## Troubleshooting

### Still seeing white page?
1. Check Netlify build logs for errors
2. Verify environment variables are set correctly
3. Make sure build command completed successfully

### Build failing?
1. Check that all dependencies are in `package.json`
2. Try building locally first: `npm run build`
3. Check Node version (should be 18+)

### Routes not working (404 on refresh)?
- The `netlify.toml` redirects configuration should fix this
- Verify the file was committed and deployed

## What Was Fixed

1. **Created `netlify.toml`**: Tells Netlify how to build and serve your SPA
2. **Added base path**: Ensures assets load from correct location
3. **Updated `.gitignore`**: Protects sensitive environment variables
4. **Redirect configuration**: Handles client-side routing for React Router

## Important Notes

- ⚠️ Never commit `.env` files to Git (they're now in `.gitignore`)
- ✅ Always set environment variables in Netlify dashboard
- ✅ The build command uses `vite build` which creates production-optimized files
- ✅ All routes redirect to `index.html` for client-side routing

## Need Help?

If you still encounter issues after following these steps:
1. Check the Netlify build logs (Deploy settings → Deploy log)
2. Verify all environment variables are set
3. Try clearing Netlify cache and redeploying
