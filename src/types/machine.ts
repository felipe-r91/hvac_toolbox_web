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
  status: "online" | "down";
  lastMaintenanceAt?: string;
  lastReportType?: "preventive" | "corrective";
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
  latestReportType?: "preventive" | "corrective";
  latestKnownStatus?: "online" | "down" | "unknown";
  preventiveReportCount: number;
  correctiveDraftCount: number;
};