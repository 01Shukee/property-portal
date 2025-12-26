# Deployment Guide - Free Hosting

## 🎯 Deployment Overview

This guide will help you deploy your Property Management Portal for **FREE** using:

- **Frontend**: Vercel (Free tier)
- **Backend**: Railway or Render (Free tier)
- **Database**: MongoDB Atlas (Free tier)

## 📋 Prerequisites

- GitHub account (for code hosting)
- Vercel account
- Railway or Render account
- MongoDB Atlas account

---

## 1️⃣ Setup MongoDB Atlas (Database)

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new project: "PropertyPortal"

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0)
3. Select region closest to Nigeria (e.g., Europe - Ireland)
4. Click "Create Cluster"

### Step 3: Setup Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Create username and password (SAVE THESE!)
4. Set privileges to "Read and write to any database"

### Step 4: Setup Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is needed for Railway/Render to connect
4. Confirm

### Step 5: Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name before `?`:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/property-portal?retryWrites=true&w=majority
   ```

---

## 2️⃣ Deploy Backend to Railway

### Option A: Railway (Recommended)

#### Step 1: Push Code to GitHub
```bash
# In your project root
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### Step 2: Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your repository
6. Select the `backend` folder

#### Step 3: Configure Environment Variables
1. In Railway project, go to "Variables" tab
2. Add these variables:
   ```
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-random-string>
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=<will-add-after-frontend-deployment>
   ```

#### Step 4: Configure Start Command
1. Go to "Settings" tab
2. Set "Start Command" to: `node server.js`
3. Set "Root Directory" to: `backend`

#### Step 5: Get Backend URL
1. Once deployed, go to "Settings"
2. Click "Generate Domain"
3. Copy your backend URL (e.g., `https://your-app.railway.app`)
4. SAVE THIS URL!

---

### Option B: Render (Alternative)

#### Step 1: Push to GitHub (same as Railway)

#### Step 2: Deploy to Render
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Name**: property-portal-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

#### Step 3: Add Environment Variables
Same as Railway step 3

#### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL
4. SAVE THIS URL!

---

## 3️⃣ Deploy Frontend to Vercel

### Step 1: Prepare Frontend for Deployment

Create `frontend/.env.production`:
```env
REACT_APP_API_URL=<your-backend-url-from-railway-or-render>
```

Example:
```env
REACT_APP_API_URL=https://your-app.railway.app/api
```

### Step 2: Update vercel.json (Create if not exists)

Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 3: Deploy to Vercel

#### Option 1: Using Vercel Dashboard
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Add Environment Variable:
   - Name: `REACT_APP_API_URL`
   - Value: Your backend URL + `/api`
7. Click "Deploy"

#### Option 2: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend folder
cd frontend
vercel --prod
```

### Step 4: Get Frontend URL
1. Once deployed, copy your frontend URL (e.g., `https://your-app.vercel.app`)
2. SAVE THIS URL!

---

## 4️⃣ Update Backend with Frontend URL

### Go back to Railway/Render:
1. Open your backend project
2. Update environment variable:
   ```
   FRONTEND_URL=<your-vercel-frontend-url>
   ```
3. Save changes (backend will auto-redeploy)

---

## ✅ Verify Deployment

### 1. Test Backend
Visit: `https://your-backend-url.railway.app/api/health`

Should see:
```json
{
  "success": true,
  "message": "Property Portal API is running"
}
```

### 2. Test Frontend
Visit: `https://your-app.vercel.app`

You should see the landing page!

### 3. Test Registration
1. Click "Get Started"
2. Fill registration form
3. Create account
4. Should redirect to dashboard

### 4. Test Login
1. Logout
2. Login with your credentials
3. Should work perfectly!

---

## 🔧 Troubleshooting

### MongoDB Connection Issues
**Problem**: Can't connect to database

**Solutions**:
1. Check connection string has correct password
2. Verify IP whitelist includes 0.0.0.0/0
3. Make sure database user has correct permissions

### CORS Errors
**Problem**: Frontend can't connect to backend

**Solutions**:
1. Verify FRONTEND_URL in backend matches your Vercel URL
2. Check backend is deployed and running
3. Verify API_URL in frontend .env.production

### Build Failures
**Problem**: Deployment fails

**Solutions**:
1. Check build logs for specific errors
2. Test build locally: `npm run build`
3. Verify all dependencies in package.json
4. Check Node.js version compatibility

### Environment Variables Not Working
**Problem**: App behaves differently in production

**Solutions**:
1. Verify all environment variables are set
2. Redeploy after changing environment variables
3. Check variable names match exactly (including REACT_APP_ prefix)

---

## 💰 Cost Breakdown

| Service | Plan | Monthly Cost | Limits |
|---------|------|--------------|--------|
| MongoDB Atlas | Free Tier | $0 | 512MB storage |
| Railway | Free Tier | $0 | 500 hours/month |
| Vercel | Free Tier | $0 | 100GB bandwidth |
| **Total** | | **$0** | Perfect for MVP |

---

## 🚀 Going to Production

When you're ready to scale:

### MongoDB Atlas
- Upgrade to M10 cluster: $0.08/hour (~$57/month)
- More storage and performance
- Automated backups

### Railway
- Hobby plan: $5/month
- More resources and uptime
- Better support

### Vercel
- Pro plan: $20/month
- Custom domains
- More bandwidth
- Priority support

### Custom Domain (Optional)
1. Buy domain from Namecheap, GoDaddy, etc. (~$10-15/year)
2. Add to Vercel in project settings
3. Configure DNS records
4. SSL automatic from Vercel

---

## 📊 Monitoring

### Free Monitoring Tools

1. **Railway/Render Dashboard**
   - View logs
   - Monitor crashes
   - Check resource usage

2. **MongoDB Atlas Dashboard**
   - Query performance
   - Database size
   - Connection metrics

3. **Vercel Analytics**
   - Page views
   - Performance metrics
   - Error tracking

---

## 🔄 Continuous Deployment

### Auto-Deploy on Push

Your setup already supports this!

1. Make changes to code
2. Commit to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Vercel and Railway automatically deploy new version!

---

## 🎉 Congratulations!

Your Property Management Portal is now:
- ✅ Live on the internet
- ✅ Accessible from anywhere
- ✅ Hosted for FREE
- ✅ Auto-deploying on updates

Share your app URL with others and start managing properties! 🏢

---

## 📝 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Connection string obtained
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Railway/Render
- [ ] Backend environment variables set
- [ ] Backend URL obtained
- [ ] Frontend environment variable updated
- [ ] Frontend deployed to Vercel
- [ ] Frontend URL obtained
- [ ] Backend FRONTEND_URL updated
- [ ] Health check endpoint tested
- [ ] Registration tested
- [ ] Login tested
- [ ] Dashboard accessible

✨ All done! Your app is live!
