# Quick Start Guide

Get your Asteroid Atlas app running in 5 minutes!

## 🚀 Local Development

### Step 1: Get API Keys

1. **Gemini API Key** (Required)
   - Visit: https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy your key

2. **NASA API Key** (Optional)
   - Visit: https://api.nasa.gov/
   - Sign up for a free API key
   - Or use `DEMO_KEY` (has rate limits)

### Step 2: Setup Project

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Step 3: Configure Environment

Edit `.env` file:
```env
NASA_API_KEY="DEMO_KEY"
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```

### Step 4: Run

```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## ☁️ Deploy to Vercel

### Option A: One-Click Deploy

1. Click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)
2. Add environment variables:
   - `GEMINI_API_KEY`
   - `NASA_API_KEY`
3. Click "Deploy"

### Option B: GitHub Deploy

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# Then:
# 1. Go to vercel.com/dashboard
# 2. Click "Add New Project"
# 3. Import your GitHub repo
# 4. Add environment variables
# 5. Click "Deploy"
```

---

## 🧪 Test Your Deployment

After deployment, test these features:

1. **Homepage** - Should load with 3D Earth
2. **Asteroid Feed** - Click "Show Live Data Feed"
3. **AI Chat** - Navigate to chat and ask a question
4. **3D Visualizer** - Check the orbit visualization

---

## ❓ Common Issues

### "API key not found"
- Make sure you added `GEMINI_API_KEY` in Vercel environment variables
- Redeploy after adding variables

### "Failed to fetch asteroid data"
- NASA API might be rate-limited with DEMO_KEY
- Get a free API key from https://api.nasa.gov/

### Build fails
- Run `npm run lint` to check for TypeScript errors
- Make sure all dependencies are installed

---

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide
- Review [VERCEL_CHECKLIST.md](VERCEL_CHECKLIST.md) before deploying

---

**Need Help?** Check the troubleshooting section in [DEPLOYMENT.md](DEPLOYMENT.md)
