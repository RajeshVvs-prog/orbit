<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Asteroid Atlas - Near-Earth Object Intelligence

Real-time asteroid tracking and orbital surveillance powered by NASA NeoWs API and Google Gemini AI.

> **🚀 Ready to Deploy?** See [DEPLOY_NOW.md](DEPLOY_NOW.md) for step-by-step deployment instructions!

## Features

- 🌍 **Real-time NASA Data**: Live asteroid tracking from NASA's Near-Earth Object Web Service
- 🤖 **AI-Powered Analysis**: Gemini AI provides intelligent insights on planetary defense
- 🎨 **3D Visualization**: Interactive orbital visualizations with Three.js
- 📊 **Live Dashboard**: Real-time statistics and hazard assessments
- 💬 **AI Chat**: Ask Orbit AI about asteroids, trajectories, and space threats

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Three.js
- **Backend**: Express.js, Node.js
- **APIs**: NASA NeoWs, Google Gemini AI
- **Deployment**: Vercel-ready

## Run Locally

**Prerequisites:** Node.js 18+

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd orbit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   - `GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - `NASA_API_KEY`: Get from [NASA API Portal](https://api.nasa.gov/) (or use "DEMO_KEY")

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Deploy to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Build Settings**
   - Framework Preset: `Other`
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**
   In Vercel project settings, add:
   - `GEMINI_API_KEY` - Your Gemini API key
   - `NASA_API_KEY` - Your NASA API key (optional)

5. **Deploy**
   Click "Deploy" and wait for the build to complete

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

## Project Structure

```
orbit/
├── src/
│   ├── components/     # React components
│   ├── services/       # API service layers
│   └── lib/           # Utility functions
├── server.ts          # Express backend server
├── vercel.json        # Vercel configuration
└── vite.config.ts     # Vite configuration
```

## API Endpoints

### Backend Routes
- `GET /api/health` - Health check
- `GET /api/asteroids` - Fetch asteroid data from NASA
- `GET /api/asteroids/:id` - Get specific asteroid details
- `POST /api/ai/planetary-status` - Get AI status report
- `POST /api/ai/chat` - Chat with Orbit AI
- `GET /api/ai/market-pulse` - Get market trends

## Security

✅ **API keys are secure**: All sensitive keys are stored on the backend only  
✅ **No client-side exposure**: Frontend makes requests to backend API endpoints  
✅ **Environment variables**: Properly configured for production deployment

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking
- `npm run vercel-build` - Build for Vercel deployment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

- NASA NeoWs API for asteroid data
- Google Gemini AI for intelligent analysis
- Three.js for 3D visualizations

---

Built with ❤️ for planetary defense
