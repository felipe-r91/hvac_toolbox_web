import type { OfficeMachineSummary } from "../types/machine";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://hvac-toolbox-backend.onrender.com";

export type MachineTimelineItem = {
  id: string;
  type: "preventive" | "corrective";
  date: string;
  status: "online" | "down" | "unknown";
  title: string;
  summary: string;
  failureComponent?: string;
  failureMode?: string;
  failureCode?: string;

  linkedCorrectiveDraftId?: string;
  sourcePreventiveReportId?: string;
};

export async function getMachineSummaryById(
  machineId: string
): Promise<OfficeMachineSummary> {
  const response = await fetch(`${API_BASE_URL}/api/summary/machines/${machineId}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load machine ${machineId}: ${text}`);
  }

  return response.json();
}

export async function getMachinePreventiveReports(
  machineId: string
): Promise<MachineTimelineItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/reports/machines/${machineId}/preventive`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load preventive reports for machine ${machineId}: ${text}`);
  }

  return response.json();
}

export async function getMachineCorrectiveReports(
  machineId: string
): Promise<MachineTimelineItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/reports/machines/${machineId}/corrective`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load corrective reports for machine ${machineId}: ${text}`);
  }

  return response.json();
}