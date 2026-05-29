export type OfficeReportCategory =
  | "machine_maintenance"
  | "service_report"
  | "cfr"
  | "daily";

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
  lastReportType?: OfficeReportCategory;
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
  latestReportType?: OfficeReportCategory;
  latestKnownStatus?: "online" | "down" | "unknown";
  machinePhotoPreviewUrl?: string;
  machineMaintenanceReportCount: number;
  serviceReportDraftCount?: number;
  cfrDraftCount: number;
  dailyDraftCount?: number;
};
