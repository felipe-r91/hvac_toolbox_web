export type OfficeMachineRow = {
  id: string;
  vesselName: string;
  machineTag: string;
  model: string;
  type: string;
  starterType: string;
  location: string;
  status: "online" | "down";
  lastMaintenanceAt?: string;
  lastReportType?: "preventive" | "corrective";
};