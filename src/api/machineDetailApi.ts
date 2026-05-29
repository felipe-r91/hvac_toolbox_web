import type { OfficeMachineSummary } from "../types/machine";
import type { OfficeReportCategory } from "../types/machine";
import { API_BASE_URL } from "./config";

export type MachineTimelineItem = {
  id: string;
  type: "machine_maintenance" | "service_report" | "cfr" | "daily";
  reportCategory: OfficeReportCategory;
  date: string;
  status: "online" | "down" | "unknown";
  title: string;
  summary: string;
  failureComponent?: string;
  failureMode?: string;
  failureCode?: string;
  linkedServiceReportDraftId?: string;
  sourceMachineMaintenanceReportId?: string;
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

export async function getMachineTimeline(
  machineId: string
): Promise<MachineTimelineItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/reports/machines/${machineId}/timeline`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load timeline for machine ${machineId}: ${text}`);
  }

  return response.json();
}
