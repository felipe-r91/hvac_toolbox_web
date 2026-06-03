import type {
  CfrDraftDetail,
  DailyReportDetail,
  HealthCheckReportDetail,
  MachineMaintenanceReportDetail,
  ServiceReportDetail,
} from "../types/report";
import { API_BASE_URL } from "./config";

export async function getMachineMaintenanceReportById(
  id: string
): Promise<MachineMaintenanceReportDetail> {
  const response = await fetch(`${API_BASE_URL}/api/reports/preventive/${id}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load machine maintenance report ${id}: ${text}`);
  }

  return response.json();
}

export async function getHealthCheckReportById(
  id: string
): Promise<HealthCheckReportDetail> {
  const response = await fetch(`${API_BASE_URL}/api/reports/health-check/${id}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load health check report ${id}: ${text}`);
  }

  return response.json();
}

export async function getHealthCheckReportsByMachine(
  machineId: string
): Promise<HealthCheckReportDetail[]> {
  const response = await fetch(`${API_BASE_URL}/api/reports/machines/${machineId}/health-check`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load health check reports for machine ${machineId}: ${text}`);
  }

  return response.json();
}

export async function getServiceReportById(id: string): Promise<ServiceReportDetail> {
  const response = await fetch(`${API_BASE_URL}/api/reports/service-report/${id}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load service report ${id}: ${text}`);
  }

  return response.json();
}

export async function getCfrReportById(id: string): Promise<CfrDraftDetail> {
  const response = await fetch(`${API_BASE_URL}/api/reports/cfr/${id}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load CFR report ${id}: ${text}`);
  }

  return response.json();
}

export async function getDailyReportById(id: string): Promise<DailyReportDetail> {
  const response = await fetch(`${API_BASE_URL}/api/reports/daily/${id}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load daily report ${id}: ${text}`);
  }

  return response.json();
}
