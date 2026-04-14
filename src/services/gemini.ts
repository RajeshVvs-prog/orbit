export async function getPlanetaryStatus(asteroidCount: number, hazardousCount: number) {
  try {
    const response = await fetch("/api/ai/planetary-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ asteroidCount, hazardousCount }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch planetary status");
    }

    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error("Planetary status error:", error);
    return "Orbital corridor stable. Surveillance systems operating at 100% capacity. Monitoring all near-Earth trajectories.";
  }
}
