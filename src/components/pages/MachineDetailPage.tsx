import { useMemo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getMachineCorrectiveReports,
  getMachinePreventiveReports,
  getMachineSummaryById,
  type MachineTimelineItem,
} from "../../api/machineDetailApi";
import type { OfficeMachineSummary } from "../../types/machine";

function statusClasses(status: "online" | "down" | "unknown") {
  return status === "online"
    ? "bg-green-100 text-green-800 ring-green-200"
    : status === "down"
    ? "bg-red-100 text-red-800 ring-red-200"
    : "bg-slate-100 text-slate-700 ring-slate-200";
}

function reportTypeClasses(type: "preventive" | "corrective") {
  return type === "preventive"
    ? "bg-blue-100 text-blue-800"
    : "bg-yellow-100 text-yellow-800";
}

export function MachineDetailPage() {
  const { machineId } = useParams();

  const [machine, setMachine] = useState<OfficeMachineSummary | null>(null);
  const [timeline, setTimeline] = useState<MachineTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!machineId) return;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const [machineData, preventive, corrective] = await Promise.all([
          getMachineSummaryById(machineId),
          getMachinePreventiveReports(machineId),
          getMachineCorrectiveReports(machineId),
        ]);

        const mergedTimeline = [...preventive, ...corrective].sort((a, b) =>
          b.date.localeCompare(a.date)
        );

        setMachine(machineData);
        setTimeline(mergedTimeline);
      } catch (err) {
        console.error(err);
        setError("Failed to load machine.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [machineId]);

  const recurringFailures = useMemo(() => {
    const failureMap = new Map<string, number>();

    timeline
      .filter((item) => item.type === "corrective")
      .forEach((item) => {
        const key = item.summary?.trim();
        if (!key) return;
        failureMap.set(key, (failureMap.get(key) || 0) + 1);
      });

    return Array.from(failureMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [timeline]);

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Loading machine...</p>
      </section>
    );
  }

  if (error || !machine) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-red-600">{error || "Machine not found."}</p>
      </section>
    );
  }

  return (
    <section className="flex h-[calc(100vh-8.5rem)] min-h-0 flex-col gap-4">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {machine.machineTag}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {machine.vesselName} · {machine.model} · {machine.starterType} · {machine.type}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Location: {machine.location}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Serial Number: {machine.serialNumber}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusClasses(
                machine.latestKnownStatus || "unknown"
              )}`}
            >
              {machine.latestKnownStatus || "unknown"}
            </span>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs font-medium text-slate-500">Last activity</p>
              <p className="mt-1 text-sm text-slate-800">
                {machine.latestReportDate
                  ? new Date(machine.latestReportDate).toLocaleString()
                  : "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs font-medium text-slate-500">Reports</p>
              <p className="mt-1 text-sm text-slate-800">
                Preventive: {machine.preventiveReportCount} · Corrective: {machine.correctiveDraftCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Reports timeline</h2>

            <div className="mt-4 space-y-4">
              {timeline.length > 0 ? (
                timeline.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(item.date).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${reportTypeClasses(
                            item.type
                          )}`}
                        >
                          {item.type}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusClasses(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-slate-600">{item.summary}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
                  No report history found.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recurring failures</h2>

            <div className="mt-4 space-y-3">
              {recurringFailures.length > 0 ? (
                recurringFailures.map((failure) => (
                  <div
                    key={failure.label}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"
                  >
                    <div className="text-sm text-slate-800">{failure.label}</div>
                    <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                      {failure.count}x
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
                  No recurring failures registered.
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">Variable trends</h3>
              <p className="mt-2 text-sm text-slate-500">
                Trend charts will be displayed here once machine variable readings are enabled.
              </p>
            </div>
          </section>
        </div>
      </section>
    </section>
  );
}