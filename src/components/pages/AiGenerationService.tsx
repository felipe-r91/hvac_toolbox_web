import { useLocation, useNavigate, useParams } from "react-router-dom";
import ConditionsFoundReportUI, {
  type AiCustomerReport,
  type SourceCfrReport,
} from "./ConditionsFoundReportUI";
import ServiceReportUI, {
  type AiServiceReport,
  type SourceServiceReport,
} from "./ServiceReportUI";
import DailyReportUI, {
  type AiDailyReport,
  type SourceDailyReport,
} from "./DailyReportUI";
import MachineMaintenanceReportUI, {
  type AiMachineMaintenanceReport,
  type SourceMachineMaintenanceReport,
} from "./MachineMaintenanceReportUI";
import HealthCheckReportUI, {
  type AiHealthCheckReport,
  type SourceHealthCheckReport,
} from "./HealthCheckReportUI";

type AiGenerationLocationState =
  | {
      reportType: "cfr";
      sourceReport: SourceCfrReport;
      aiReport: AiCustomerReport;
    }
  | {
      reportType: "service_report";
      sourceReport: SourceServiceReport;
      aiReport: AiServiceReport;
    }
  | {
      reportType: "daily";
      sourceReport: SourceDailyReport;
      aiReport: AiDailyReport;
    }
  | {
      reportType: "machine_maintenance";
      sourceReport: SourceMachineMaintenanceReport;
      aiReport: AiMachineMaintenanceReport;
    }
  | {
      reportType: "health_check";
      sourceReport: SourceHealthCheckReport;
      aiReport: AiHealthCheckReport;
    };

export function AiGenerationService() {
  const { reportType, reportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as AiGenerationLocationState | undefined;

  if (!state?.aiReport) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-red-600">
          AI report data was not found. Please return to the original report and generate it again.
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
        >
          Go back
        </button>
      </section>
    );
  }

  if (reportType === "cfr" && state.reportType === "cfr") {
    return (
      <div className="h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200">
        <ConditionsFoundReportUI
          aiReport={state.aiReport}
          sourceReport={state.sourceReport}
        />
      </div>
    );
  }

  if (reportType === "service-report" && state.reportType === "service_report") {
    return (
      <div className="h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200">
        <ServiceReportUI
          aiReport={state.aiReport}
          sourceReport={state.sourceReport}
        />
      </div>
    );
  }

  if (reportType === "daily" && state.reportType === "daily") {
    return (
      <div className="h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200">
        <DailyReportUI
          aiReport={state.aiReport}
          sourceReport={state.sourceReport}
        />
      </div>
    );
  }

  if (reportType === "machine-maintenance" && state.reportType === "machine_maintenance") {
    return (
      <div className="h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200">
        <MachineMaintenanceReportUI
          aiReport={state.aiReport}
          sourceReport={state.sourceReport}
        />
      </div>
    );
  }

  if (reportType === "health-check" && state.reportType === "health_check") {
    return (
      <div className="h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200">
        <HealthCheckReportUI
          aiReport={state.aiReport}
          sourceReport={state.sourceReport}
        />
      </div>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-600">
        AI generation page for {reportType} is not implemented yet.
      </p>
      <p className="mt-1 text-xs text-slate-400">Report ID: {reportId}</p>
    </section>
  );
}
