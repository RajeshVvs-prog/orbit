import express from "express";
import axios from "axios";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json());

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Gemini AI endpoints
let lastStatus = "";
let lastCounts = { asteroids: -1, hazardous: -1 };

app.post("/api/ai/planetary-status", async (req, res) => {
  try {
    const { asteroidCount, hazardousCount } = req.body;

    // Simple cache to save quota if data hasn't changed
    if (lastStatus && lastCounts.asteroids === asteroidCount && lastCounts.hazardous === hazardousCount) {
      return res.json({ status: lastStatus });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are Orbit AI, a planetary defense intelligence system. 
      Current data: ${asteroidCount} near-Earth objects detected today, with ${hazardousCount} classified as potentially hazardous.
      Provide a concise, professional, and slightly futuristic status report (max 30 words) for the mission control dashboard. 
      Focus on the safety of Earth and the current surveillance status.`,
    });

    const text = response.text || "Orbital corridor stable. Surveillance systems operating at 100% capacity. Monitoring all near-Earth trajectories.";
    lastStatus = text;
    lastCounts = { asteroids: asteroidCount, hazardous: hazardousCount };
    
    res.json({ status: text });
  } catch (error: any) {
    const errorString = JSON.stringify(error);
    const isQuotaError = 
      error?.status === "RESOURCE_EXHAUSTED" || 
      error?.code === 429 || 
      errorString.includes("RESOURCE_EXHAUSTED") ||
      errorString.includes("429");

    if (isQuotaError) {
      console.warn("Gemini API quota exceeded. Using local fallback status.");
    } else {
      console.error("Gemini API Error:", error);
    }
    
    res.json({ status: "Orbital corridor stable. Surveillance systems operating at 100% capacity. Monitoring all near-Earth trajectories." });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are Orbit AI, a specialized intelligence engine for planetary defense and orbital mechanics. 
        Your goal is to provide deep, actionable insights based on NASA's Near-Earth Object data.
        You explain asteroid trajectories, potential hazards, and space exploration topics.
        Use a professional, scientific, and clear tone. Use Markdown for formatting.
        Always prioritize safety and data-driven reasoning.`,
        temperature: 0.7,
      },
    });

    res.json({ response: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

app.get("/api/ai/market-pulse", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Provide a JSON summary of the current top 4 global tech market trends for Q2 2026. Include sector name, sentiment score (0-100), and a brief 1-sentence outlook.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sector: { type: Type.STRING },
              sentiment: { type: Type.NUMBER },
              outlook: { type: Type.STRING },
              trend: { type: Type.STRING, enum: ["up", "down", "stable"] }
            },
            required: ["sector", "sentiment", "outlook", "trend"]
          }
        }
      }
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.json([]);
  }
});

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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
