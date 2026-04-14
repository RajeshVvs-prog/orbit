import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    console.log("Testing Groq API...");
    console.log("API Key:", process.env.GROQ_API_KEY ? "Found" : "Missing");
    
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: "Say hello in one word"
        }
      ],
      max_tokens: 10,
    });

    console.log("Success! Response:", response.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Full error:", error);
  }
}

test();
