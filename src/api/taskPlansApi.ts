import { API_BASE_URL } from "./config";
import type {
  TaskPlanKind,
  TaskPlanLibraryResponse,
  TaskPlanPayload,
  TaskPlanTemplate,
} from "../types/taskPlan";

const endpoints: Record<TaskPlanKind, string> = {
  maintenance: "/api/fleet/template-library",
  "health-check": "/api/fleet/health-check-template-library",
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function getTaskPlanTemplates(
  kind: TaskPlanKind
): Promise<TaskPlanTemplate[]> {
  const data = await request<TaskPlanLibraryResponse>(endpoints[kind]);
  return data.templates;
}

export async function saveTaskPlanTemplate(
  kind: TaskPlanKind,
  payload: TaskPlanPayload,
  existingCode?: string
): Promise<TaskPlanTemplate> {
  const path = existingCode
    ? `${endpoints[kind]}/${encodeURIComponent(existingCode)}`
    : endpoints[kind];

  return request<TaskPlanTemplate>(path, {
    method: existingCode ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteTaskPlanTemplate(
  kind: TaskPlanKind,
  code: string
): Promise<void> {
  await request<void>(`${endpoints[kind]}/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
}
