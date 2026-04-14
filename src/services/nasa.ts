import axios from "axios";
import { format } from "date-fns";

export interface Asteroid {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_hour: string;
    };
    miss_distance: {
      kilometers: string;
    };
    orbiting_body: string;
  }>;
}

export async function getAsteroidFeed(startDate?: string, endDate?: string) {
  const start = startDate || format(new Date(), "yyyy-MM-dd");
  const end = endDate || format(new Date(), "yyyy-MM-dd");

  try {
    const response = await axios.get("/api/asteroids", {
      params: {
        start_date: start,
        end_date: end
      }
    });
    
    const asteroidsByDate = response.data.near_earth_objects;
    const allAsteroids: Asteroid[] = [];
    
    Object.keys(asteroidsByDate).forEach(date => {
      allAsteroids.push(...asteroidsByDate[date]);
    });

    return allAsteroids.sort((a, b) => {
      const distA = parseFloat(a.close_approach_data[0].miss_distance.kilometers);
      const distB = parseFloat(b.close_approach_data[0].miss_distance.kilometers);
      return distA - distB;
    });
  } catch (error) {
    console.error("Error fetching asteroid feed:", error);
    return [];
  }
}
