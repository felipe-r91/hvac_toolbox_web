import MachineMaintenanceReportUI, {
  type AiHealthCheckReport,
  type SourceHealthCheckReport,
} from "./MachineMaintenanceReportUI";

export type { AiHealthCheckReport, SourceHealthCheckReport };

export default function HealthCheckReportUI({
  aiReport,
  sourceReport,
}: {
  aiReport: AiHealthCheckReport;
  sourceReport: SourceHealthCheckReport;
}) {
  return (
    <MachineMaintenanceReportUI
      aiReport={aiReport}
      sourceReport={sourceReport}
      variant="health_check"
    />
  );
}
