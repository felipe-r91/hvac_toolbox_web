export type OfficeReportCategory = "health_check" | "corrective" | "cfr";

export type OfficeMachine = {
  id: string;
  vesselId: string;
  location: string;
  tag: string;
  model: string;
  serialNumber: string;
  type: string;
  starterType: string;
};

export type OfficeMachineRow = {
  id: string;
  vesselId: string;
  vesselName: string;
  machineTag: string;
  model: string;
  serialNumber: string;
  type: string;
  starterType: string;
  location: string;
  status: "online" | "down" | "unknown";
  lastMaintenanceAt?: string;
  lastReportType?: "health_check" | "corrective" | "cfr";
};

export type OfficeMachineSummary = {
  machineId: string;
  vesselId: string;
  vesselName: string;
  machineTag: string;
  model: string;
  serialNumber: string;
  type: string;
  starterType: string;
  location: string;
  latestReportDate?: string;
  latestReportType?: "health_check" | "corrective" | "cfr";
  latestKnownStatus?: "online" | "down" | "unknown";
  preventiveReportCount: number;
  correctiveDraftCount: number;
  cfrDraftCount: number;
};