# Application Architecture

## Overview

Asteroid Atlas is a full-stack application with a React frontend and Express.js backend, optimized for Vercel deployment.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           React Frontend (Vite)                     │    │
│  │                                                      │    │
│  │  • Components (UI)                                  │    │
│  │  • Services (API Clients)                           │    │
│  │  • 3D Visualizations (Three.js)                     │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          │ HTTP Requests                     │
│                          ▼                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    VERCEL PLATFORM                           │
│                          │                                   │
│  ┌───────────────────────▼────────────────────────────┐    │
│  │         Static Files (dist/)                        │    │
│  │         • index.html                                │    │
│  │         • JavaScript bundles                        │    │
│  │         • CSS files                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Serverless Functions (api/)                      │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  /api/ai/planetary-status                     │   │  │
│  │  │  /api/ai/chat                                 │   │  │
│  │  │  /api/ai/market-pulse                         │   │  │
│  │  │  /api/asteroids                               │   │  │
│  │  │  /api/asteroids/:id                           │   │  │
│  │  │  /api/health                                  │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                       │                               │  │
│  │                       │ Secure API Calls              │  │
│  │                       ▼                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Environment Variables (Secure)                │  │
│  │         • GEMINI_API_KEY                              │  │
│  │         • NASA_API_KEY                                │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ External API Calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL APIS                             │
│                                                              │
│  ┌────────────────────┐         ┌─────────────────────┐    │
│  │   NASA NeoWs API   │         │   Google Gemini AI  │    │
│  │                    │         │                     │    │
│  │  • Asteroid Data   │         │  • AI Chat          │    │
│  │  • NEO Feed        │         │  • Status Reports   │    │
│  │  • Orbital Data    │         │  • Analysis         │    │
│  └────────────────────┘         └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Interaction
```
User clicks "Chat with AI"
  ↓
Frontend sends POST to /api/ai/chat
  ↓
Vercel routes to serverless function
  ↓
Backend calls Gemini API (with secure key)
  ↓
Response flows back to user
```

### 2. Asteroid Data Fetch
```
App loads
  ↓
Frontend sends GET to /api/asteroids
  ↓
Vercel routes to serverless function
  ↓
Backend calls NASA API
  ↓
Data returned and displayed
```

## Security Model

### ✅ Secure (Backend)
- API keys stored in Vercel environment variables
- Keys never exposed to browser
- All external API calls from backend

### ❌ Insecure (Avoided)
- ~~API keys in frontend code~~
- ~~Direct API calls from browser~~
- ~~Keys in git repository~~

## File Structure

```
orbit/
├── api/                    # Vercel serverless functions
│   └── index.ts           # All API endpoints
│
├── src/                   # Frontend source
│   ├── components/        # React components
│   │   ├── ChatPanel.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Earth3D.tsx
│   │   └── ...
│   ├── services/          # API client services
│   │   ├── ai.ts         # AI service (calls backend)
│   │   ├── gemini.ts     # Gemini service (calls backend)
│   │   └── nasa.ts       # NASA service (calls backend)
│   └── lib/              # Utilities
│
├── dist/                  # Build output (generated)
│   ├── index.html
│   └── assets/
│
├── server.ts             # Local dev server
├── vercel.json           # Vercel config
├── vite.config.ts        # Vite config
└── package.json          # Dependencies
```

## Deployment Flow

```
1. Developer pushes to GitHub
   ↓
2. Vercel detects push
   ↓
3. Vercel runs: npm run build
   ↓
4. Frontend built to dist/
   ↓
5. API functions deployed from api/
   ↓
6. Environment variables injected
   ↓
7. Application live!
```

## Local Development

```
npm run dev
  ↓
server.ts starts
  ↓
Express server with Vite middleware
  ↓
Frontend: http://localhost:3000
Backend: http://localhost:3000/api/*
```

## Production (Vercel)

```
User visits site
  ↓
Vercel CDN serves static files (dist/)
  ↓
API calls routed to serverless functions (api/)
  ↓
Functions execute with environment variables
  ↓
Responses cached and optimized by Vercel
```

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Three.js** - 3D visualizations
- **Motion** - Animations

### Backend
- **Express.js** - API framework
- **Node.js** - Runtime
- **Axios** - HTTP client
- **Google GenAI SDK** - Gemini integration

### Deployment
- **Vercel** - Hosting platform
- **Serverless Functions** - API endpoints
- **CDN** - Static file delivery

## API Endpoints

| Endpoint | Method | Purpose | External API |
|----------|--------|---------|--------------|
| `/api/ai/planetary-status` | POST | AI status report | Gemini |
| `/api/ai/chat` | POST | Chat with AI | Gemini |
| `/api/ai/market-pulse` | GET | Market trends | Gemini |
| `/api/asteroids` | GET | Asteroid feed | NASA |
| `/api/asteroids/:id` | GET | Specific asteroid | NASA |
| `/api/health` | GET | Health check | None |

## Environment Variables

| Variable | Required | Purpose | Where Set |
|----------|----------|---------|-----------|
| `GEMINI_API_KEY` | Yes | Gemini AI access | Vercel Dashboard |
| `NASA_API_KEY` | No | NASA API access | Vercel Dashboard |
| `PORT` | No | Server port | Auto (Vercel) |
| `NODE_ENV` | No | Environment | Auto (Vercel) |

## Performance Optimizations

1. **Static File Caching** - Vercel CDN caches all static assets
2. **Serverless Functions** - Auto-scaling based on demand
3. **Code Splitting** - Vite automatically splits bundles
4. **Tree Shaking** - Unused code removed in production
5. **Compression** - Gzip/Brotli compression enabled

## Monitoring

- **Vercel Analytics** - Page views, performance
- **Function Logs** - API endpoint monitoring
- **Error Tracking** - Console errors logged
- **Build Logs** - Deployment status

---

This architecture ensures security, scalability, and optimal performance for the Asteroid Atlas application.
