export async function getStrategicAnalysis(prompt: string) {
  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("AI chat error:", error);
    throw error;
  }
}

export async function getMarketPulse() {
  try {
    const response = await fetch("/api/ai/market-pulse");

    if (!response.ok) {
      throw new Error("Failed to get market pulse");
    }

    return await response.json();
  } catch (error) {
    console.error("Market pulse error:", error);
    return [];
  }
}
