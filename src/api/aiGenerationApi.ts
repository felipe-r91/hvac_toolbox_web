import { API_BASE_URL } from "./config";

export type DraftReportType = "cfr" | "service_report" | "preventive" | "daily";

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

export type ServiceReportDraftSummaryResponse = {
  id: string;
  vesselName: string;
  machineTag: string;
  machineModel?: string;
  machineLocation?: string;
  createdAt: string;
  workPerformed?: string;
  recommendations?: string;
  furtherActionRequired?: string;
  machineReturnedToService?: string;
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

export type DailyDraftSummaryResponse = {
  id: string;
  vesselName: string;
  machineTag: string;
  machineModel: string;
  machineLocation: string;
  createdAt: string;
  alarmPresent?: boolean;
  reportCategory: string;
  failureComponent?: string;
  failureMode?: string;
  failureCode?: string;
  workConductedToday?: string;
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
  vesselImo?: string;
  vesselImoNumber?: string;
  imoNumber?: string;
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
  vesselImo?: string;
  vesselImoNumber?: string;
  imoNumber?: string;
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

export type AiDailyReportResponse = {
  reportNo: string;
  title: string;
  subtitle: string;
  company: string;
  vesselImo?: string;
  vesselImoNumber?: string;
  imoNumber?: string;
  branch: string;
  date: string;
  serviceOrder: string;
  engineer: string;
  projectManager: string;
  location: string;
  machineStatus: string;
  alarms?: ServiceAlarmItem[];
  workConducted?: string[];
  furtherActions?: string[];
  ehsStatement: string;
};

export type ServiceAlarmItem = {
  description: string;
  status: string;
};

export type AiGeneratedReportResponse =
  | AiCustomerReportResponse
  | AiServiceReportResponse
  | AiDailyReportResponse;

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

export async function getServiceReportDrafts(): Promise<
  ServiceReportDraftSummaryResponse[]
> {
  return request<ServiceReportDraftSummaryResponse[]>("/api/reports/service-report");
}

export async function getPreventiveReports(): Promise<
  PreventiveReportSummaryResponse[]
> {
  return request<PreventiveReportSummaryResponse[]>("/api/reports/preventive");
}

export async function getDailyDrafts(): Promise<DailyDraftSummaryResponse[]> {
  return request<DailyDraftSummaryResponse[]>("/api/reports/daily");
}

export async function getAiGenerationDrafts(): Promise<DraftReportRow[]> {
  const [cfrDrafts, serviceReportDrafts, preventiveReports, dailyDrafts] = await Promise.all([
    getCfrDrafts(),
    getServiceReportDrafts(),
    getPreventiveReports(),
    getDailyDrafts(),
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

  const serviceReportRows: DraftReportRow[] = serviceReportDrafts.map((draft) => ({
    id: draft.id,
    vessel: safeValue(draft.vesselName),
    machine: machineLabel(draft.machineTag, draft.machineModel),
    machineLocation: safeValue(draft.machineLocation),
    type: "service_report",
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

  const dailyRows: DraftReportRow[] = dailyDrafts.map((draft) => ({
    id: draft.id,
    vessel: safeValue(draft.vesselName),
    machine: machineLabel(draft.machineTag, draft.machineModel),
    machineLocation: safeValue(draft.machineLocation),
    type: "daily",
    date: draft.createdAt,
    status: draft.alarmPresent ? "Alarm present" : "No alarm",
    reportCategory: draft.reportCategory || "daily",
  }));

  return [...cfrRows, ...serviceReportRows, ...preventiveRows, ...dailyRows].sort(sortByNewestDate);
}

function apiReportTypePath(type: DraftReportType) {
  return type === "service_report" ? "service-report" : type;
}

export async function generateAiReport(
  type: DraftReportType,
  id: string
): Promise<AiGeneratedReportResponse> {
  if (type === "preventive") {
    throw new Error("Health Check AI generation is not implemented yet.");
  }

  return request<AiGeneratedReportResponse>(
    `/api/ai-reports/${apiReportTypePath(type)}/${id}/generate`,
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

export async function generateServiceReportAiReport(
  draftId: string
): Promise<AiServiceReportResponse> {
  return request<AiServiceReportResponse>(
    `/api/ai-reports/service-report/${draftId}/generate`,
    {
      method: "POST",
    }
  );
}

export async function generateDailyAiReport(
  draftId: string
): Promise<AiDailyReportResponse> {
  return request<AiDailyReportResponse>(
    `/api/ai-reports/daily/${draftId}/generate`,
    {
      method: "POST",
    }
  );
}
