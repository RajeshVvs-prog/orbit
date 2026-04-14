import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Groq AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Enable JSON body parsing
  app.use(express.json());

  // NASA API Proxy
  app.get("/api/asteroids", async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
      const response = await axios.get(`https://api.nasa.gov/neo/rest/v1/feed`, {
        params: {
          start_date,
          end_date,
          api_key: apiKey
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("NASA API Error:", error);
      res.status(500).json({ error: "Failed to fetch asteroid data" });
    }
  });

  app.get("/api/asteroids/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
      const response = await axios.get(`https://api.nasa.gov/neo/rest/v1/neo/${id}`, {
        params: {
          api_key: apiKey
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("NASA Lookup Error:", error);
      res.status(500).json({ error: "Failed to lookup asteroid" });
    }
  });

  // Groq AI endpoints
  let lastStatus = "";
  let lastCounts = { asteroids: -1, hazardous: -1 };

  app.post("/api/ai/planetary-status", async (req, res) => {
    try {
      const { asteroidCount, hazardousCount } = req.body;

      // Simple cache to save quota if data hasn't changed
      if (lastStatus && lastCounts.asteroids === asteroidCount && lastCounts.hazardous === hazardousCount) {
        return res.json({ status: lastStatus });
      }

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are Orbit AI, a planetary defense intelligence system. Provide concise, professional, and slightly futuristic status reports for mission control."
          },
          {
            role: "user",
            content: `Current data: ${asteroidCount} near-Earth objects detected today, with ${hazardousCount} classified as potentially hazardous. Provide a status report (max 30 words) focusing on Earth's safety and surveillance status.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      });

      const text = response.choices[0]?.message?.content || "Orbital corridor stable. Surveillance systems operating at 100% capacity. Monitoring all near-Earth trajectories.";
      lastStatus = text;
      lastCounts = { asteroids: asteroidCount, hazardous: hazardousCount };
      
      res.json({ status: text });
    } catch (error: any) {
      console.error("Groq API Error:", error);
      res.json({ status: "Orbital corridor stable. Surveillance systems operating at 100% capacity. Monitoring all near-Earth trajectories." });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      console.log("Groq API Key present:", !!process.env.GROQ_API_KEY);
      console.log("Sending request to Groq...");

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are Orbit AI, a specialized intelligence engine for planetary defense and orbital mechanics. 
            Your goal is to provide deep, actionable insights based on NASA's Near-Earth Object data.
            You explain asteroid trajectories, potential hazards, and space exploration topics.
            Use a professional, scientific, and clear tone. Use Markdown for formatting.
            Always prioritize safety and data-driven reasoning.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });

      console.log("Groq response received");
      res.json({ response: response.choices[0]?.message?.content || "I apologize, but I couldn't process that request." });
    } catch (error: any) {
      console.error("Groq API Error:", error.message);
      console.error("Full error:", error);
      res.status(500).json({ error: "Failed to get AI response", details: error.message });
    }
  });

  app.get("/api/ai/market-pulse", async (req, res) => {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a tech market analyst. Respond only with valid JSON, no markdown formatting."
          },
          {
            role: "user",
            content: "Provide a JSON array of the current top 4 global tech market trends for Q2 2026. Each item should have: sector (string), sentiment (number 0-100), outlook (string, 1 sentence), trend (string: 'up', 'down', or 'stable'). Return only the JSON array, no other text."
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || "[]";
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      res.json(JSON.parse(jsonContent));
    } catch (error) {
      console.error("Groq API Error:", error);
      res.json([
        { sector: "AI/ML", sentiment: 85, outlook: "Strong growth in enterprise AI adoption.", trend: "up" },
        { sector: "Quantum Computing", sentiment: 65, outlook: "Steady progress in quantum hardware.", trend: "up" },
        { sector: "Cloud Infrastructure", sentiment: 75, outlook: "Continued expansion in hybrid cloud.", trend: "stable" },
        { sector: "Cybersecurity", sentiment: 80, outlook: "Rising demand for zero-trust solutions.", trend: "up" }
      ]);
    }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
