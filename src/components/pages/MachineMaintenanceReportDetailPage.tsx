import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getHealthCheckReportById,
  getMachineMaintenanceReportById,
} from "../../api/reportDetailApi";
import type {
  HealthCheckReportDetail,
  MachineMaintenanceReportDetail,
} from "../../types/report";
import { API_BASE_URL } from "../../api/config";
import { VscSparkle } from "react-icons/vsc";

type MaintenanceLikeReportDetail =
  | MachineMaintenanceReportDetail
  | HealthCheckReportDetail;

type MaintenanceLikeReportConfig = {
  title: string;
  badgeLabel: string;
  badgeClassName: string;
  loadingText: string;
  notFoundText: string;
  failedLoadText: string;
  aiPreparingText: string;
  aiSteps: string[];
  aiEndpointPath: string;
  aiReceivingText: string;
  aiSuccessText: string;
  aiRoutePath: string;
  aiReportType: "machine_maintenance" | "health_check";
};

const machineMaintenanceReportConfig: MaintenanceLikeReportConfig = {
  title: "Machine Maintenance Report",
  badgeLabel: "Machine Maintenance",
  badgeClassName: "bg-blue-100 text-blue-800",
  loadingText: "Loading machine maintenance report...",
  notFoundText: "Machine maintenance report not found.",
  failedLoadText: "Failed to load machine maintenance report.",
  aiPreparingText: "Preparing maintenance report data...",
  aiSteps: [
    "Reading maintenance tasks...",
    "Reviewing task notes and measured values...",
    "Checking alarm and fault items...",
    "Building maintenance activity summary...",
    "Generating customer-ready maintenance report...",
    "Formatting maintenance report sections...",
  ],
  aiEndpointPath: "machine-maintenance",
  aiReceivingText: "Receiving generated maintenance report...",
  aiSuccessText: "Machine maintenance report generated successfully.",
  aiRoutePath: "machine-maintenance",
  aiReportType: "machine_maintenance",
};

const healthCheckReportConfig: MaintenanceLikeReportConfig = {
  title: "Health Check Report",
  badgeLabel: "Health Check",
  badgeClassName: "bg-cyan-100 text-cyan-800",
  loadingText: "Loading health check report...",
  notFoundText: "Health check report not found.",
  failedLoadText: "Failed to load health check report.",
  aiPreparingText: "Preparing health check report data...",
  aiSteps: [
    "Reading health check tasks...",
    "Reviewing health notes and measured values...",
    "Checking alarms and abnormal findings...",
    "Building health check activity summary...",
    "Generating customer-ready health check report...",
    "Formatting health check report sections...",
  ],
  aiEndpointPath: "health-check",
  aiReceivingText: "Receiving generated health check report...",
  aiSuccessText: "Health check report generated successfully.",
  aiRoutePath: "health-check",
  aiReportType: "health_check",
};

function resolvePhotoUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
}

function statusClasses(status?: string) {
  if (status === "online") return "bg-green-100 text-green-800 ring-green-200";
  if (status === "down") return "bg-red-100 text-red-800 ring-red-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function taskStatusClasses(status?: string) {
  if (status === "ok") return "bg-green-100 text-green-800";
  if (status === "attention") return "bg-yellow-100 text-yellow-800";
  if (status === "fault") return "bg-red-100 text-red-800";
  if (status === "skipped") return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-600";
}

function formatFailureCode(code?: string) {
  if (!code) return "—";

  return code
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function LoadingImage({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  emptyText = "No image available",
}: {
  src?: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  emptyText?: string;
}) {
  const [loadedSrc, setLoadedSrc] = useState("");
  const [failedSrc, setFailedSrc] = useState("");
  const isLoading = Boolean(src) && loadedSrc !== src && failedSrc !== src;
  const hasError = Boolean(src) && failedSrc === src;

  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 ${wrapperClassName}`}>
        <div className="px-6 text-center text-sm text-slate-400">
          {hasError ? "Image failed to load." : emptyText}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${wrapperClassName}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-100 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <p className="text-xs font-medium">Loading image...</p>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={() => setLoadedSrc(src)}
        onError={() => {
          setFailedSrc(src);
        }}
      />
    </div>
  );
}

function AiGenerationProgress({
  progress,
  step,
}: {
  progress: number;
  step: string;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            AI report generation
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {step || "Preparing AI generation..."}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          {progress}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function MachineMaintenanceReportDetailPage() {
  return (
    <MaintenanceLikeReportDetailPage
      config={machineMaintenanceReportConfig}
      loadReport={getMachineMaintenanceReportById}
    />
  );
}

export function HealthCheckReportDetailPage() {
  return (
    <MaintenanceLikeReportDetailPage
      config={healthCheckReportConfig}
      loadReport={getHealthCheckReportById}
    />
  );
}

function MaintenanceLikeReportDetailPage({
  config,
  loadReport,
}: {
  config: MaintenanceLikeReportConfig;
  loadReport: (id: string) => Promise<MaintenanceLikeReportDetail>;
}) {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState<MaintenanceLikeReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStep, setAiStep] = useState("");

  useEffect(() => {
    if (!reportId) return;

    const run = async () => {
      try {
        setLoading(true);
        setError("");
        setReport(await loadReport(reportId));
      } catch (err) {
        console.error(err);
        setError(config.failedLoadText);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [config.failedLoadText, loadReport, reportId]);

  useEffect(() => {
    if (!aiLoading) return;

    setAiProgress(8);
    setAiStep(config.aiPreparingText);

    const steps = config.aiSteps.map((text, index) => ({
      progress: [18, 34, 50, 66, 82, 92][index] || 92,
      text,
    }));

    let index = 0;

    const interval = window.setInterval(() => {
      const step = steps[index];

      if (!step) {
        window.clearInterval(interval);
        return;
      }

      setAiProgress((current) => Math.max(current, step.progress));
      setAiStep(step.text);
      index += 1;
    }, 1100);

    return () => window.clearInterval(interval);
  }, [aiLoading, config.aiPreparingText, config.aiSteps]);

  if (loading) return <CardText text={config.loadingText} />;
  if (error || !report) {
    return <CardText text={error || config.notFoundText} error />;
  }

  const headerPhoto = report.machinePhotoPreviewUrl || "";

  async function handleGenerateAiReport() {
    if (!report?.id || aiLoading) return;

    try {
      setAiLoading(true);
      setAiProgress(5);
      setAiStep("Starting AI generation...");

      const response = await fetch(
        `${API_BASE_URL}/api/ai-reports/${config.aiEndpointPath}/${report.id}/generate`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setAiProgress(96);
      setAiStep(config.aiReceivingText);

      const aiReport = await response.json();

      setAiProgress(100);
      setAiStep(config.aiSuccessText);

      window.setTimeout(() => {
        navigate(`/ai-generation-service/${config.aiRoutePath}/${report.id}`, {
          state: {
            reportType: config.aiReportType,
            sourceReport: report,
            aiReport,
          },
        });
      }, 350);
    } catch (err) {
      console.error(err);
      setAiStep("AI generation failed. Please try again.");
      setAiProgress(0);
    } finally {
      window.setTimeout(() => {
        setAiLoading(false);
      }, 500);
    }
  }

  return (
    <section className="h-[calc(100vh-8.5rem)] min-h-0 overflow-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="space-y-4">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {config.title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(report.completedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.badgeClassName}`}>
                  {config.badgeLabel}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusClasses(
                    report.overallStatus
                  )}`}
                >
                  {report.overallStatus}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <HeaderInfo label="Vessel" value={report.vesselName} />
              <HeaderInfo label="Machine" value={report.machineTag} />
              <HeaderInfo label="Model" value={report.machineModel} />
              <HeaderInfo label="Location" value={report.machineLocation} />
            </div>

            <div className="-mt-2.5 flex justify-end">
              <button
                type="button"
                onClick={handleGenerateAiReport}
                disabled={aiLoading}
                className="flex items-center justify-between gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <VscSparkle size={24} />
                {aiLoading ? "Generating..." : "Generate AI Report"}
              </button>
            </div>

            {aiLoading && (
              <AiGenerationProgress progress={aiProgress} step={aiStep} />
            )}
          </div>

          <LoadingImage
            src={resolvePhotoUrl(headerPhoto)}
            alt={report.machineTag}
            wrapperClassName="flex h-44 items-center justify-center rounded-3xl ring-1 ring-slate-200 lg:h-full lg:max-h-56"
            className="h-full w-full object-cover"
            emptyText="No machine photo available"
          />
        </div>
      </section>

          {report.overallStatus === "down" ? (
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Failure Information
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <InfoCard label="Component" value={report.failureComponent || "—"} />
                <InfoCard label="Mode" value={report.failureMode || "—"} />
                <InfoCard label="Code" value={formatFailureCode(report.failureCode)} />
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
                {report.failureNotes || report.downtimeReason || "—"}
              </p>
            </section>
          ) : null}

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>

              <p className="text-sm text-slate-500">
                Faults: {report.faultCount ?? 0} · Skipped:{" "}
                {report.skippedCount ?? 0}
              </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-200">
              <table className="min-w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      Category
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      Task
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      Value
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                      Notes
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {report.tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {task.category}
                      </td>

                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {task.taskName}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${taskStatusClasses(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {task.measuredValue
                          ? `${task.measuredValue} ${task.unit || ""}`
                          : "—"}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-500">
                        {task.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
      </div>
    </section>
  );
}

function HeaderInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

function CardText({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <p className={`text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
        {text}
      </p>
    </section>
  );
}
