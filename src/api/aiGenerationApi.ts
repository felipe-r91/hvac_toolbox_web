import { API_BASE_URL } from "./config";

export type DraftReportType = "cfr" | "corrective" | "preventive";

export type CfrDraftSummaryResponse = {
  id: string;
  vesselName: string;
  machineTag: string;
  machineModel: string;
  machineLocation: string;
  createdAt: string;
  machineStatus: string;
  failureComponent: string;
  failureMode: string;
  failureCode: string;
  conditionFound: string;
  reportCategory: string;
};

export type CorrectiveDraftSummaryResponse = {
  id: string;
  vesselName: string;
  machineTag: string;
  machineModel: string;
  machineLocation: string;
  createdAt: string;
  failureComponent: string;
  failureMode: string;
  failureCode: string;
  problemSummary: string;
  machineReturnedToService: string;
  reportCategory: string;
};

export type PreventiveReportSummaryResponse = {
  id: string;
  vesselName: string;
  machineTag: string;
  machineModel: string;
  machineLocation: string;
  completedAt: string;
  overallStatus: string;
  faultCount: number;
  skippedCount: number;
};

export type DraftReportRow = {
  id: string;
  vessel: string;
  machine: string;
  machineLocation: string;
  type: DraftReportType;
  date: string;
  status?: string;
  reportCategory?: string;
};

export type AiCustomerReportResponse = {
  reportNo: string;
  title: string;
  subtitle: string;
  company: string;
  branch: string;
  date: string;
  serviceOrder: string;
  engineer: string;
  projectManager: string;
  location: string;
  machineStatus: string;
  severity: string;
  finalCondition: string;
  executiveSummary: string;
  conditionFound: string;
  alarms: string[];
  operationalImpact: string;
  probableRootCause: string;
  recommendations: string[];
  furtherActionRequired: string;
  ehsStatement: string;
};

export type AiServiceReportResponse = {
  reportNo: string;
  title: string;
  subtitle: string;
  company: string;
  branch: string;
  date: string;
  serviceOrder: string;
  engineer: string;
  projectManager: string;
  location: string;
  machineStatus: string;
  serviceResult: string;
  machineReturnedToService: string;
  executiveSummary: string;
  conditionFound: string;
  alarms: ServiceAlarmItem[];
  workConducted: string[];
  recommendations: string[];
  furtherActionRequired: string;
  ehsStatement: string;
};

export type ServiceAlarmItem = {
  description: string;
  status: string;
};

export type AiGeneratedReportResponse =
  | AiCustomerReportResponse
  | AiServiceReportResponse;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function machineLabel(machineTag?: string, machineModel?: string): string {
  if (machineTag && machineModel) {
    return `${machineTag} - ${machineModel}`;
  }

  return machineTag || machineModel || "Not informed";
}

function safeValue(value?: string): string {
  return value?.trim() || "Not informed";
}

function sortByNewestDate(a: DraftReportRow, b: DraftReportRow): number {
  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();

  if (Number.isNaN(dateA) && Number.isNaN(dateB)) {
    return 0;
  }

  if (Number.isNaN(dateA)) {
    return 1;
  }

  if (Number.isNaN(dateB)) {
    return -1;
  }

  return dateB - dateA;
}

export async function getCfrDrafts(): Promise<CfrDraftSummaryResponse[]> {
  return request<CfrDraftSummaryResponse[]>("/api/reports/cfr");
}

export async function getCorrectiveDrafts(): Promise<
  CorrectiveDraftSummaryResponse[]
> {
  return request<CorrectiveDraftSummaryResponse[]>("/api/reports/corrective");
}

export async function getPreventiveReports(): Promise<
  PreventiveReportSummaryResponse[]
> {
  return request<PreventiveReportSummaryResponse[]>("/api/reports/preventive");
}

export async function getAiGenerationDrafts(): Promise<DraftReportRow[]> {
  const [cfrDrafts, correctiveDrafts, preventiveReports] = await Promise.all([
    getCfrDrafts(),
    getCorrectiveDrafts(),
    getPreventiveReports(),
  ]);

  const cfrRows: DraftReportRow[] = cfrDrafts.map((draft) => ({
    id: draft.id,
    vessel: safeValue(draft.vesselName),
    machine: machineLabel(draft.machineTag, draft.machineModel),
    machineLocation: safeValue(draft.machineLocation),
    type: "cfr",
    date: draft.createdAt,
    status: safeValue(draft.machineStatus),
    reportCategory: draft.reportCategory,
  }));

  const correctiveRows: DraftReportRow[] = correctiveDrafts.map((draft) => ({
    id: draft.id,
    vessel: safeValue(draft.vesselName),
    machine: machineLabel(draft.machineTag, draft.machineModel),
    machineLocation: safeValue(draft.machineLocation),
    type: "corrective",
    date: draft.createdAt,
    status: safeValue(draft.machineReturnedToService),
    reportCategory: draft.reportCategory,
  }));

  const preventiveRows: DraftReportRow[] = preventiveReports.map((report) => ({
    id: report.id,
    vessel: safeValue(report.vesselName),
    machine: machineLabel(report.machineTag, report.machineModel),
    machineLocation: safeValue(report.machineLocation),
    type: "preventive",
    date: report.completedAt,
    status: safeValue(report.overallStatus),
    reportCategory: "health_check",
  }));

  return [...cfrRows, ...correctiveRows, ...preventiveRows].sort(sortByNewestDate);
}

export async function generateAiReport(
  type: DraftReportType,
  id: string
): Promise<AiGeneratedReportResponse> {
  if (type === "preventive") {
    throw new Error("Health Check AI generation is not implemented yet.");
  }

  return request<AiGeneratedReportResponse>(
    `/api/ai-reports/${type}/${id}/generate`,
    {
      method: "POST",
    }
  );
}

export async function generateCfrAiReport(
  draftId: string
): Promise<AiCustomerReportResponse> {
  return request<AiCustomerReportResponse>(
    `/api/ai-reports/cfr/${draftId}/generate`,
    {
      method: "POST",
    }
  );
}

export async function generateCorrectiveAiReport(
  draftId: string
): Promise<AiServiceReportResponse> {
  return request<AiServiceReportResponse>(
    `/api/ai-reports/corrective/${draftId}/generate`,
    {
      method: "POST",
    }
  );
}
