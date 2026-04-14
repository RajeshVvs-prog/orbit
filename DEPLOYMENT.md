# Deployment Guide for Vercel

This guide will help you deploy your Asteroid Atlas application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [NASA API key](https://api.nasa.gov/) (optional - can use DEMO_KEY)
3. A [Gemini API key](https://aistudio.google.com/app/apikey) (required for AI features)

## Environment Variables

You need to set the following environment variables in Vercel:

### Required:
- `GEMINI_API_KEY` - Your Google Gemini API key from AI Studio

### Optional:
- `NASA_API_KEY` - Your NASA API key (defaults to "DEMO_KEY" if not set)
- `PORT` - Server port (Vercel handles this automatically)

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables:
```bash
vercel env add GEMINI_API_KEY
vercel env add NASA_API_KEY
```

5. Deploy to production:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New Project"

4. Import your repository

5. Configure your project:
   - **Framework Preset**: Other
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Add Environment Variables:
   - Click "Environment Variables"
   - Add `GEMINI_API_KEY` with your API key
   - Add `NASA_API_KEY` with your NASA key (or use "DEMO_KEY")

7. Click "Deploy"

## Important Notes

### Security
- ✅ API keys are now stored on the backend only
- ✅ Frontend makes requests to backend API endpoints
- ✅ No sensitive keys are exposed in the browser

### API Endpoints
The application uses these backend endpoints:
- `POST /api/ai/planetary-status` - Get AI-generated status
- `POST /api/ai/chat` - Chat with Orbit AI
- `GET /api/ai/market-pulse` - Get market trends
- `GET /api/asteroids` - Get asteroid data from NASA
- `GET /api/asteroids/:id` - Get specific asteroid details

## Project Structure

The application uses a hybrid architecture:
- **Frontend**: React SPA built with Vite (served from `/dist`)
- **Backend**: Express.js API routes (in `/api` directory for Vercel serverless functions)
- **Local Development**: Full Express server with Vite middleware (`server.ts`)

### Directory Structure
```
orbit/
├── api/
│   └── index.ts       # Vercel serverless API routes
├── src/
│   ├── components/    # React components
│   ├── services/      # Frontend API clients
│   └── lib/          # Utilities
├── server.ts         # Local development server
└── vercel.json       # Vercel configuration
```

## Testing Locally

Before deploying, test locally:

1. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Add your API keys to `.env`

3. Install dependencies:
```bash
npm install
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000

## Troubleshooting

### Build Fails
- Make sure all dependencies are in `package.json`
- Check that TypeScript compiles without errors: `npm run lint`

### API Errors
- Verify environment variables are set in Vercel dashboard
- Check Vercel function logs for error messages

### 404 Errors
- Ensure `vercel.json` routing is correct
- Check that the build output is in the `dist` folder

## Support

For issues with:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **NASA API**: Visit [NASA API Portal](https://api.nasa.gov/)
- **Gemini API**: Visit [Google AI Studio](https://aistudio.google.com/)
