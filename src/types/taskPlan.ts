export type TaskPlanKind = "maintenance" | "health-check";

export type MaintenanceTemplateType = "MACHINE" | "STARTER";

export type TaskPlanTemplateType = MaintenanceTemplateType | "HEALTH_CHECK";

export type TaskPlanTask = {
  id?: string;
  taskCode?: string;
  category?: string | null;
  task: string;
  tool?: string | null;
  unit?: string | null;
  required?: boolean;
  measurable?: boolean;
  photoRequiredOnFault?: boolean;
  photoRequiredOnAttention?: boolean;
};

export type TaskPlanTemplate = {
  code: string;
  name: string;
  templateType: TaskPlanTemplateType;
  versionId?: string;
  versionNumber?: number;
  notes?: string | null;
  tasks: TaskPlanTask[];
};

export type TaskPlanLibraryResponse = {
  templates: TaskPlanTemplate[];
};

export type TaskPlanPayload = {
  code: string;
  name: string;
  templateType?: MaintenanceTemplateType;
  notes?: string;
  tasks: TaskPlanTask[];
};
