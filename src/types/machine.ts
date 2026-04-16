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