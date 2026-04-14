# Vercel Deployment Guide - Step by Step

## ✅ Prerequisites Complete
- ✅ Code pushed to GitHub: https://github.com/RajeshVvs-prog/orbit
- ✅ Groq AI configured and working locally
- ✅ NASA API key ready
- ✅ Vercel configuration updated

## 🚀 Deploy to Vercel (5 minutes)

### Step 1: Go to Vercel Dashboard
Visit: **https://vercel.com/new**

### Step 2: Import Your Repository
1. Click "Import Git Repository"
2. If not connected, click "Add GitHub Account"
3. Find and select: **RajeshVvs-prog/orbit**
4. Click "Import"

### Step 3: Configure Project Settings

Leave these as default (Vercel will auto-detect):
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Step 4: Add Environment Variables

Click "Environment Variables" and add these **EXACTLY**:

#### Variable 1:
```
Name: GROQ_API_KEY
Value: [Your Groq API key from .env file]
Environment: Production, Preview, Development (select all 3)
```

#### Variable 2:
```
Name: NASA_API_KEY
Value: [Your NASA API key from .env file]
Environment: Production, Preview, Development (select all 3)
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://orbit-xxx.vercel.app`

## ✅ Verify Deployment

After deployment, test these:

### 1. Homepage
Visit your Vercel URL - should see 3D Earth

### 2. Health Check
Visit: `https://your-app.vercel.app/api/health`
Should return: `{"status":"ok","timestamp":"..."}`

### 3. Asteroid Data
- Scroll down on homepage
- Click "Show Live Data Feed"
- Should see asteroid list

### 4. AI Chat
- Navigate to chat section
- Ask: "What is an asteroid?"
- Should get AI response

## 🐛 Troubleshooting

### Build Fails
**Check:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the failed deployment
3. Check "Build Logs" for errors
4. Common fix: Redeploy (click "Redeploy" button)

### API Not Working
**Check:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify both `GROQ_API_KEY` and `NASA_API_KEY` are set
3. Make sure they're enabled for "Production"
4. After adding/changing variables, click "Redeploy"

### 404 Errors on API Routes
**Check:**
1. Make sure `vercel.json` is in your repo
2. Redeploy the project
3. Check Functions tab in Vercel dashboard

### AI Chat Not Responding
**Check:**
1. Open browser console (F12)
2. Look for errors
3. Check Network tab for failed requests
4. Go to Vercel Dashboard → Functions → Check logs
5. Verify `GROQ_API_KEY` is correct

## 📊 Monitor Your Deployment

### View Logs
1. Go to Vercel Dashboard
2. Click your project
3. Click "Functions" tab
4. See real-time logs of API calls

### View Analytics
1. Go to Vercel Dashboard
2. Click your project
3. Click "Analytics" tab
4. See visitor stats and performance

## 🔄 Update Your Deployment

When you make changes:

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically redeploy!

## 🎉 Success Checklist

- [ ] Deployment completed without errors
- [ ] Homepage loads with 3D Earth
- [ ] Asteroid data displays
- [ ] AI chat responds
- [ ] No console errors in browser
- [ ] API health check returns OK

## 📞 Need Help?

If something doesn't work:
1. Check the troubleshooting section above
2. View Vercel function logs
3. Check browser console for errors
4. Verify environment variables are set correctly

---

**Your Vercel URL**: `https://orbit-xxx.vercel.app`

Share it with the world! 🌍🚀
