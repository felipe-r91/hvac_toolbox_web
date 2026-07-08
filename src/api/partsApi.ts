import type { Part, PartPayload } from "../types/part";
import { API_BASE_URL } from "./config";

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

  return response.json() as Promise<T>;
}

export function resolvePartPhotoUrl(photoUrl?: string | null) {
  if (!photoUrl) return "";

  if (
    photoUrl.startsWith("http://") ||
    photoUrl.startsWith("https://") ||
    photoUrl.startsWith("data:") ||
    photoUrl.startsWith("blob:")
  ) {
    return photoUrl;
  }

  return `${API_BASE_URL}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
}

export async function getParts(): Promise<Part[]> {
  return request<Part[]>("/api/parts");
}

export async function getPartById(partId: string): Promise<Part> {
  return request<Part>(`/api/parts/${encodeURIComponent(partId)}`);
}

export async function createPart(payload: PartPayload): Promise<Part> {
  return request<Part>("/api/parts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePart(
  partId: string,
  payload: PartPayload
): Promise<Part> {
  return request<Part>(`/api/parts/${encodeURIComponent(partId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadPartPicture(
  partId: string,
  file: File
): Promise<Part> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/parts/${encodeURIComponent(partId)}/picture`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Picture upload failed with status ${response.status}`);
  }

  return response.json() as Promise<Part>;
}

export async function deletePart(partId: string): Promise<void> {
  await request<void>(`/api/parts/${encodeURIComponent(partId)}`, {
    method: "DELETE",
  });
}
