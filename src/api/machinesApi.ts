import type { OfficeMachineSummary } from "../types/machine";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://hvac-toolbox-backend.onrender.com";


export async function getMachineSummaries(): Promise<OfficeMachineSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/summary/machines`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load machine summaries: ${text}`);
  }

  return response.json();
}