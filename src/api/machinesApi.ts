import type { OfficeMachineSummary } from "../types/machine";
import { API_BASE_URL } from "./config";

export async function getMachineSummaries(): Promise<OfficeMachineSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/summary/machines`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load machine summaries: ${text}`);
  }

  return response.json();
}