import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHealthCheckReportById } from "../../api/reportDetailApi";
import type { PreventiveReportDetail } from "../../types/report";

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

export function HealthCheckReportDetailPage() {
  const { reportId } = useParams();

  const [report, setReport] = useState<PreventiveReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reportId) return;

    const run = async () => {
      try {
        setLoading(true);
        setError("");
        setReport(await getHealthCheckReportById(reportId));
      } catch (err) {
        console.error(err);
        setError("Failed to load health check report.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [reportId]);

  if (loading) return <CardText text="Loading health check..." />;
  if (error || !report) {
    return <CardText text={error || "Health check not found."} error />;
  }

  return (
    <section className="flex h-[calc(100vh-8.5rem)] min-h-0 flex-col gap-4">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Health Check Report
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(report.completedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Health Check
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

            <div className="mt-6 space-y-4">
              <HeaderInfo label="Vessel" value={report.vesselName} />
              <HeaderInfo label="Machine" value={report.machineTag} />
              <HeaderInfo
                label="Model"
                value={`${report.machineModel} · ${report.machineStarterType}`}
              />
              <HeaderInfo label="Location" value={report.machineLocation} />
            </div>
          </div>

          <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200">
            <div className="px-6 text-center text-sm text-slate-400">
              Machine photo will be displayed here
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-4">
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