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
  machineType: string;
  machineStarterType: string;
  machineLocation: string;
  createdAt: string;

  machineStatus: "online" | "down" | "unknown";
  reportCategory: "cfr";

  failureComponent?: string;
  failureMode?: string;
  failureCode?: string;

  conditionFound: string;
  symptomsObserved: string;
  alarmsObserved: string;
  operationalImpact: string;

  preliminaryDiagnosis: string;
  confirmedCause: string;

  recommendations: string;
  furtherActionRequired: string;

  synced: boolean;
  photos: CfrPhotoDetail[];
};

export type ReportPhotoDetail = {
  id: string;
  filename: string;
  caption: string;
  createdAt: string;
  previewUrl: string;
};

export type PreventiveTaskDetail = {
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
  completedAt?: string;
};

export type PreventiveReportDetail = {
  id: string;
  vesselName: string;
  machineTag: string;
  machineModel: string;
  machineType: string;
  machineLocation: string;
  machineStarterType: string;
  completedAt: string;
  overallStatus: "online" | "down" | "unknown";
  downtimeReason?: string;
  failureComponent?: string;
  failureMode?: string;
  failureCode?: string;
  failureNotes?: string;
  linkedCorrectiveDraftId?: string;
  faultCount?: number;
  skippedCount?: number;
  reportCategory: "health_check";
  tasks: PreventiveTaskDetail[];
};

export type CorrectiveReportDetail = {
  id: string;
  vesselName: string;
  machineTag: string;
  machineModel: string;
  machineType: string;
  machineStarterType: string;
  machineLocation: string;
  createdAt: string;

  failureComponent?: string;
  failureMode?: string;
  failureCode?: string;

  problemSummary: string;
  conditionFound: string;
  symptomsObserved: string;
  alarmsObserved: string;
  operationalImpact: string;

  preliminaryDiagnosis: string;
  confirmedCause: string;

  correctiveAction: string;
  recommendations: string;
  furtherActionRequired: string;

  machineReturnedToService: "yes" | "no" | "unknown";
  sourcePreventiveReportId?: string;
  reportCategory: "corrective";
  photos: ReportPhotoDetail[];
};
