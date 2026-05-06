import { useLocation, useNavigate, useParams } from "react-router-dom";
import ConditionsFoundReportUI, {
  type AiCustomerReport,
  type SourceCfrReport,
} from "./ConditionsFoundReportUI";
import ServiceReportUI, {
  type AiServiceReport,
  type SourceServiceReport,
} from "./ServiceReportUI";

type AiGenerationLocationState =
  | {
      reportType: "cfr";
      sourceReport: SourceCfrReport;
      aiReport: AiCustomerReport;
    }
  | {
      reportType: "corrective";
      sourceReport: SourceServiceReport;
      aiReport: AiServiceReport;
    }
  | {
      reportType: "health_check";
      sourceReport: unknown;
      aiReport: unknown;
    };

export function AiGenerationPage() {
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

  if (reportType === "corrective" && state.reportType === "corrective") {
    return (
      <div className="h-[calc(100vh-96px)] overflow-y-auto overflow-x-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200">
        <ServiceReportUI
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
