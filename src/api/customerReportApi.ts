import { API_BASE_URL } from "./config";

export type CreateCustomerReportPayload = {
  sourceReportId?: string;
  sourceReportType: "cfr" | "corrective" | "health_check";

  vesselId?: string;
  vesselName?: string;

  machineId?: string;
  machineTag?: string;
  machineModel?: string;
  machineType?: string;
  machineStatus?: string;

  title?: string;
  createdBy?: string;
};

export type CustomerReportResponse = {
  id: string;
  sourceReportId?: string;
  sourceReportType?: "cfr" | "corrective" | "health_check";
  vesselId?: string;
  vesselName?: string;
  machineId?: string;
  machineTag?: string;
  machineModel?: string;
  machineType?: string;
  machineStatus?: string;
  title?: string;
  reportDate?: string;
  pdfFilename?: string;
  createdAt?: string;
};

export async function uploadCustomerReportPdf(payload: unknown, pdfFile: File) {
  console.log("Uploading PDF with payload:", payload);

  const formData = new FormData();

  formData.append(
    "metadata",
    new Blob([JSON.stringify(payload)], {
      type: "application/json",
    })
  );

  formData.append("file", pdfFile);

  const response = await fetch(`${API_BASE_URL}/api/customer-reports`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function findCustomerReports(params?: {
  vesselId?: string;
  machineId?: string;
  reportType?: string;
}) {
  const query = new URLSearchParams();

  if (params?.vesselId) query.append("vesselId", params.vesselId);
  if (params?.machineId) query.append("machineId", params.machineId);
  if (params?.reportType) query.append("reportType", params.reportType);

  const response = await fetch(
    `${API_BASE_URL}/api/customer-reports${query.toString() ? `?${query}` : ""}`
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<CustomerReportResponse[]>;
}

export async function getCustomerReportDownloadUrl(reportId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/customer-reports/${reportId}/download-url`,
    {
      headers: {
        Accept: "text/plain",
      },
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.text();
}

export async function downloadCustomerReportPdf(
  reportId: string,
  filename: string
) {
  const downloadUrl = await getCustomerReportDownloadUrl(reportId);

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}