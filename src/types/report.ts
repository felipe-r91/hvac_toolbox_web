export type CfrPhotoDetail = {
  id: string;
  filename: string;
  caption: string;
  createdAt: string;
  previewUrl: string;
};

export type CfrDraftDetail = {
  id: string;
  vesselId: string;
  vesselName: string;
  machineId: string;
  machineTag: string;
  machineModel: string;
  machineSerialNumber?: string;
  machineType: string;
  machineStarterType: string;
  machineLocation: string;
  machinePhotoId?: string;
  machinePhotoPreviewUrl?: string;
  createdAt: string;

  machineStatus: string;
  reportCategory: string;

  failureComponent?: string;
  failureMode?: string;
  failureCode?: string;

  conditionFound?: string;
  symptomsObserved?: string;
  alarmsObserved?: string;
  operationalImpact?: string;
  preliminaryDiagnosis?: string;
  confirmedCause?: string;
  recommendations?: string;
  furtherActionRequired?: string;

  synced?: boolean;
  photos: CfrPhotoDetail[];
};

export type ReportPhotoDetail = {
  id: string;
  filename: string;
  caption: string;
  createdAt: string;
  previewUrl: string;
};

export type MachineMaintenanceTaskDetail = {
  id: string;
  taskTemplateId: string;
  category: string;
  taskName: string;
  tool?: string;
  checked: boolean;
  status: string;
  notes?: string;
  measuredValue?: string;
  unit?: string;
  photoIds?: string[];
  photos?: ReportPhotoDetail[];
  completedAt?: string;
};

export type MachineMaintenanceReportDetail = {
  id: string;
  vesselId: string;
  vesselName: string;
  machineId: string;
  machineTag: string;
  machineModel: string;
  machineType: string;
  machineLocation: string;
  machinePhotoId?: string;
  machinePhotoPreviewUrl?: string;
  machineStarterType: string;
  completedAt: string;
  overallStatus: "online" | "down" | "unknown";
  downtimeReason?: string;
  failureComponent?: string;
  failureMode?: string;
  failureCode?: string;
  failureNotes?: string;
  linkedServiceReportDraftId?: string;
  faultCount?: number;
  skippedCount?: number;
  reportCategory: "machine_maintenance";
  tasks: MachineMaintenanceTaskDetail[];
  photos?: ReportPhotoDetail[];
};

export type ServiceReportDetail = {
  id: string;
  vesselId: string;
  vesselName: string;
  vesselImo?: string;
  vesselType?: string;
  ownerCustomer?: string;
  vesselContact?: string;
  machineId: string;
  machineTag: string;
  machineModel?: string;
  machineSerialNumber?: string;
  machineType?: string;
  machineStarterType?: string;
  machineLocation?: string;
  machineRefrigerant?: string;
  machineOilType?: string;
  machineControlSystem?: string;
  machineSoftwareVersion?: string;
  machineCompressorType?: string;
  machineMfg?: string;
  machinePhotoId?: string;
  machinePhotoPreviewUrl?: string;
  createdAt: string;

  workPerformed?: string;
  recommendations?: string;
  furtherActionRequired?: string;

  machineReturnedToService?: "yes" | "no" | "unknown" | string;
  sourceMachineMaintenanceReportId?: string;
  reportCategory: "service_report";
  synced?: boolean;
  photos?: ReportPhotoDetail[];
};

export type DailyReportDetail = {
  id: string;
  vesselId: string;
  vesselName: string;
  machineId: string;
  machineTag: string;
  machineModel: string;
  machineSerialNumber?: string;
  machineType: string;
  machineStarterType: string;
  machineLocation: string;
  machinePhotoId?: string;
  machinePhotoPreviewUrl?: string;
  createdAt: string;

  alarmPresent?: boolean;
  reportCategory: "daily";

  failureComponent?: string;
  failureMode?: string;
  failureCode?: string;
  failureNotes?: string;

  workConductedToday?: string;
  furtherActions?: string;

  synced?: boolean;
  photos: ReportPhotoDetail[];
};
