import type { OfficeMachine } from "../types/machine";
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

export async function getVesselById(vesselId: string): Promise<OfficeVessel> {
  const response = await fetch(`${API_BASE_URL}/api/fleet/vessels/${vesselId}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load vessel ${vesselId}: ${text}`);
  }

  return response.json();
}

export async function getMachines(): Promise<OfficeMachine[]> {
  const response = await fetch(`${API_BASE_URL}/api/fleet/machines`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load machines: ${text}`);
  }

  return response.json();
}