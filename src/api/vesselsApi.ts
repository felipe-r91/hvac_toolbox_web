import type { OfficeVessel } from "../types/vessel";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://hvac-toolbox-backend.onrender.com";

export async function getVessels(): Promise<OfficeVessel[]> {
  const response = await fetch(`${API_BASE_URL}/api/fleet/vessels`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load vessels: ${text}`);
  }

  return response.json();
}