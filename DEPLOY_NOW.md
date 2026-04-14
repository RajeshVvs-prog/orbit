# 🚀 Deploy to Vercel NOW

Follow these exact steps to deploy your Asteroid Atlas app to Vercel.

## ⚡ Prerequisites (2 minutes)

### 1. Get Your API Keys

#### Gemini API Key (Required)
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

#### NASA API Key (Optional)
1. Go to: https://api.nasa.gov/
2. Fill the form and submit
3. Check your email for the key
4. Or just use `DEMO_KEY` (has rate limits)

---

## 🎯 Option 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub (2 minutes)

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel (3 minutes)

1. **Go to Vercel**
   - Visit: https://vercel.com/dashboard
   - Click "Add New Project"

2. **Import Repository**
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: `Other` (leave as detected)
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (should auto-detect)
   - Output Directory: `dist` (should auto-detect)
   - Install Command: `npm install` (should auto-detect)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   Name: GEMINI_API_KEY
   Value: [paste your Gemini API key]
   ```
   
   ```
   Name: NASA_API_KEY
   Value: DEMO_KEY
   ```
   
   (Or use your actual NASA API key)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! 🎉

---

## 🎯 Option 2: Deploy via Vercel CLI (Advanced)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# First deployment (preview)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? [Enter name or press Enter]
# - Directory? ./ [Press Enter]
# - Override settings? No [Press Enter]
```

### Step 4: Add Environment Variables

```bash
# Add Gemini API key
vercel env add GEMINI_API_KEY

# When prompted:
# - Value: [paste your key]
# - Environments: Production, Preview, Development (select all)

# Add NASA API key
vercel env add NASA_API_KEY

# When prompted:
# - Value: DEMO_KEY
# - Environments: Production, Preview, Development (select all)
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

---

## ✅ Verify Deployment (2 minutes)

After deployment completes, Vercel will give you a URL like:
`https://your-app.vercel.app`

### Test These Features:

1. **Homepage Loads**
   - Visit your URL
   - Should see 3D Earth and hero section

2. **Asteroid Data**
   - Scroll down
   - Click "Show Live Data Feed"
   - Should see asteroid list

3. **AI Chat**
   - Navigate to chat section
   - Type a question
   - Should get AI response

4. **3D Visualization**
   - Check orbit visualizer
   - Should render 3D scene

### Check for Errors:

1. **Browser Console**
   - Press F12
   - Check Console tab
   - Should have no red errors

2. **Network Tab**
   - Press F12
   - Go to Network tab
   - Refresh page
   - All requests should be 200 OK

3. **Vercel Logs**
   - Go to Vercel Dashboard
   - Click your project
   - Click "Functions" tab
   - Check for errors

---

## 🐛 Troubleshooting

### Build Failed

**Error**: "Build failed"

**Solution**:
```bash
# Test build locally
npm run build

# If it fails, check:
npm run lint

# Fix any TypeScript errors
```

### API Key Not Working

**Error**: "API key not found" or "Unauthorized"

**Solution**:
1. Go to Vercel Dashboard
2. Click your project
3. Go to Settings → Environment Variables
4. Verify `GEMINI_API_KEY` is set
5. Click "Redeploy" button

### 404 Errors

**Error**: "404 Not Found" on routes

**Solution**:
1. Check `vercel.json` exists
2. Redeploy the project
3. Clear browser cache

### AI Not Responding

**Error**: AI chat doesn't work

**Solution**:
1. Check browser console for errors
2. Verify `GEMINI_API_KEY` in Vercel
3. Check Vercel function logs
4. Try with a different prompt

### Asteroid Data Not Loading

**Error**: No asteroid data shows

**Solution**:
1. Check if using `DEMO_KEY` (has rate limits)
2. Get real NASA API key
3. Check Vercel function logs
4. Wait a few minutes and retry

---

## 🎉 Success!

Your app is now live! Share your URL:

```
https://your-app.vercel.app
```

### Next Steps:

1. **Custom Domain** (Optional)
   - Go to Vercel Dashboard
   - Click your project
   - Go to Settings → Domains
   - Add your domain

2. **Analytics** (Optional)
   - Go to Vercel Dashboard
   - Click your project
   - Enable Vercel Analytics

3. **Monitoring**
   - Check Vercel Dashboard regularly
   - Monitor function logs
   - Watch for errors

---

## 📞 Need Help?

- **Vercel Issues**: https://vercel.com/support
- **Build Errors**: Check [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Issues**: Check [VERCEL_CHECKLIST.md](VERCEL_CHECKLIST.md)

---

**Deployment Time**: ~10 minutes total

**You're done! 🚀**
