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

export async function uploadCustomerReportPdf(
  payload: CreateCustomerReportPayload,
  pdfFile: File
) {
  const formData = new FormData();

  formData.append(
    "request",
    new Blob([JSON.stringify(payload)], {
      type: "application/json",
    })
  );

  console.log("Uploading PDF with payload:", payload);
  console.log("Uploading PDF file:", pdfFile);

  formData.append("pdfFile", pdfFile);

  const response = await fetch(`${API_BASE_URL}/api/customer-reports`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}