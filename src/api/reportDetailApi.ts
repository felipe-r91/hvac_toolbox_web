import type { CfrDraftDetail, CorrectiveReportDetail, PreventiveReportDetail } from "../types/report";
import { API_BASE_URL } from "./config";

export async function getHealthCheckReportById(id: string): Promise<PreventiveReportDetail> {
  const response = await fetch(`${API_BASE_URL}/api/reports/preventive/${id}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load health check ${id}: ${text}`);
  }

  return response.json();
}

export async function getCorrectiveReportById(id: string): Promise<CorrectiveReportDetail> {
  const response = await fetch(`${API_BASE_URL}/api/reports/corrective/${id}`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load corrective report ${id}: ${text}`);
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