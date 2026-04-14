# Vercel Deployment Checklist

Use this checklist to ensure your deployment is successful.

## Pre-Deployment

- [ ] All dependencies installed (`npm install`)
- [ ] TypeScript compiles without errors (`npm run lint`)
- [ ] Local testing completed (`npm run dev`)
- [ ] Environment variables documented in `.env.example`
- [ ] `.gitignore` excludes `.env` files
- [ ] Code pushed to GitHub/GitLab/Bitbucket

## Vercel Configuration

- [ ] `vercel.json` exists and is properly configured
- [ ] Build command set to `npm run vercel-build`
- [ ] Output directory set to `dist`
- [ ] API routes configured in `vercel.json`

## Environment Variables (Required)

Set these in Vercel Dashboard → Project Settings → Environment Variables:

### Production
- [ ] `GEMINI_API_KEY` - Your Google Gemini API key
- [ ] `NASA_API_KEY` - Your NASA API key (or "DEMO_KEY")

### Preview (Optional)
- [ ] Same as production (recommended)

### Development (Optional)
- [ ] Same as production (recommended)

## Security Checklist

- [ ] ✅ API keys moved from frontend to backend
- [ ] ✅ No `process.env` usage in frontend code
- [ ] ✅ All AI calls go through backend API endpoints
- [ ] ✅ CORS configured if needed
- [ ] ✅ Rate limiting considered for API endpoints

## Post-Deployment

- [ ] Deployment successful (check Vercel dashboard)
- [ ] Visit deployed URL and test functionality
- [ ] Check browser console for errors
- [ ] Test AI chat functionality
- [ ] Test asteroid data loading
- [ ] Verify 3D visualizations work
- [ ] Check Vercel function logs for errors

## Testing Checklist

Visit your deployed site and verify:

- [ ] Homepage loads correctly
- [ ] Asteroid data displays
- [ ] 3D Earth visualization renders
- [ ] Orbit visualizer works
- [ ] AI chat responds correctly
- [ ] Navigation works
- [ ] No console errors
- [ ] Mobile responsive design works

## Troubleshooting

### Build Fails
1. Check Vercel build logs
2. Run `npm run build` locally to reproduce
3. Verify all dependencies in `package.json`
4. Check TypeScript errors with `npm run lint`

### API Errors
1. Verify environment variables are set in Vercel
2. Check Vercel function logs
3. Test API endpoints directly: `https://your-app.vercel.app/api/health`

### Frontend Issues
1. Check browser console for errors
2. Verify API endpoints are being called correctly
3. Check network tab for failed requests

## Useful Commands

```bash
# Test build locally
npm run build

# Check TypeScript
npm run lint

# Deploy to Vercel (CLI)
vercel

# Deploy to production (CLI)
vercel --prod

# View logs (CLI)
vercel logs
```

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [NASA API Docs](https://api.nasa.gov/)
- [Gemini API Docs](https://ai.google.dev/docs)

---

✅ **Ready to Deploy!** Once all items are checked, your app is ready for production.
