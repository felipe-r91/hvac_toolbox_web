import { useMemo, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getMachineSummaryById,
  getMachineTimeline,
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

function reportTypeClasses(type: "health_check" | "corrective" | "cfr") {
  if (type === "health_check") {
    return "bg-blue-100 text-blue-800";
  }

  if (type === "corrective") {
    return "bg-yellow-100 text-yellow-800";
  }

  return "bg-purple-100 text-purple-800";
}

function reportTypeLabel(type: "health_check" | "corrective" | "cfr") {
  if (type === "health_check") return "Health Check";
  if (type === "corrective") return "Corrective";
  return "CFR";
}

function formatFailureCode(code?: string) {
  if (!code) return "Unknown";
  return code
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function buildRecurringFailureLabel(item: MachineTimelineItem) {
  if (item.failureCode) {
    return formatFailureCode(item.failureCode);
  }

  if (item.failureComponent && item.failureMode) {
    return `${item.failureComponent} · ${item.failureMode}`;
  }

  if (item.failureMode) {
    return item.failureMode;
  }

  if (item.failureComponent) {
    return item.failureComponent;
  }

  return null;
}

type DisplayTimelineItem =
  | {
    kind: "single";
    item: MachineTimelineItem;
    date: string;
  }
  | {
    kind: "linked";
    healthCheck: MachineTimelineItem;
    corrective: MachineTimelineItem;
    date: string;
  };

function buildDisplayTimeline(items: MachineTimelineItem[]): DisplayTimelineItem[] {
  const healthChecks = items.filter((item) => item.reportCategory === "health_check");
  const corrective = items.filter((item) => item.reportCategory === "corrective");
  const cfr = items.filter((item) => item.reportCategory === "cfr");

  const correctiveBySourcePreventiveId = new Map<string, MachineTimelineItem>();
  const correctiveById = new Map(corrective.map((item) => [item.id, item]));
  const linkedCorrectiveIds = new Set<string>();

  corrective.forEach((item) => {
    if (item.sourcePreventiveReportId) {
      correctiveBySourcePreventiveId.set(item.sourcePreventiveReportId, item);
    }
  });

  const merged: DisplayTimelineItem[] = [];

  healthChecks.forEach((healthCheckItem) => {
    const linkedCorrective =
      (healthCheckItem.linkedCorrectiveDraftId
        ? correctiveById.get(healthCheckItem.linkedCorrectiveDraftId)
        : undefined) ||
      correctiveBySourcePreventiveId.get(healthCheckItem.id);

    if (linkedCorrective) {
      linkedCorrectiveIds.add(linkedCorrective.id);

      merged.push({
        kind: "linked",
        healthCheck: healthCheckItem,
        corrective: linkedCorrective,
        date: linkedCorrective.date || healthCheckItem.date,
      });
    } else {
      merged.push({
        kind: "single",
        item: healthCheckItem,
        date: healthCheckItem.date,
      });
    }
  });

  corrective.forEach((correctiveItem) => {
    if (!linkedCorrectiveIds.has(correctiveItem.id)) {
      merged.push({
        kind: "single",
        item: correctiveItem,
        date: correctiveItem.date,
      });
    }
  });

  cfr.forEach((cfrItem) => {
    merged.push({
      kind: "single",
      item: cfrItem,
      date: cfrItem.date,
    });
  });

  return merged.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function getReportLink(item: MachineTimelineItem) {
  if (item.reportCategory === "health_check") {
    return `/reports/${item.id}`;
  }

  if (item.reportCategory === "corrective") {
    return `/corrective-reports/${item.id}`;
  }

  return `/cfr-reports/${item.id}`;
}

function getReportLinkLabel(item: MachineTimelineItem) {
  if (item.reportCategory === "health_check") {
    return "Open health check";
  }

  if (item.reportCategory === "corrective") {
    return "Open corrective";
  }

  return "Open CFR";
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

        const [machineData, timelineData] = await Promise.all([
          getMachineSummaryById(machineId),
          getMachineTimeline(machineId),
        ]);

        setMachine(machineData);
        setTimeline(timelineData);
      } catch (err) {
        console.error(err);
        setError("Failed to load machine.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [machineId]);

  const displayTimeline = useMemo(() => {
    return buildDisplayTimeline(timeline);
  }, [timeline]);

  const recurringFailures = useMemo(() => {
    const failureMap = new Map<string, number>();

    timeline
      .filter(
        (item) =>
          item.reportCategory === "corrective" || item.reportCategory === "cfr"
      )
      .forEach((item) => {
        const key = buildRecurringFailureLabel(item);
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
                Health Checks: {machine.preventiveReportCount} · Corrective: {machine.correctiveDraftCount} · CFR: {machine.cfrDraftCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="flex min-h-0 flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
            <h2 className="shrink-0 text-lg font-semibold text-slate-900">
              Reports timeline
            </h2>

            <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {displayTimeline.length > 0 ? (
                displayTimeline.map((entry) => {
                  if (entry.kind === "linked") {
                    const healthCheck = entry.healthCheck;
                    const corrective = entry.corrective;

                    return (
                      <div
                        key={`linked-${healthCheck.id}-${corrective.id}`}
                        className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                              Corrective Maintenance
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(entry.date).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">
                              Corrective
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusClasses(
                                corrective.status
                              )}`}
                            >
                              {corrective.status}
                            </span>
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-slate-600">
                          {corrective.summary}
                        </p>

                        {(corrective.failureCode ||
                          corrective.failureComponent ||
                          corrective.failureMode) ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {corrective.failureCode ? (
                              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                                {formatFailureCode(corrective.failureCode)}
                              </span>
                            ) : null}

                            {corrective.failureComponent ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {corrective.failureComponent}
                              </span>
                            ) : null}

                            {corrective.failureMode ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {corrective.failureMode}
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            to={`/corrective-reports/${corrective.id}`}
                            className="rounded-2xl bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-300"
                          >
                            Open corrective
                          </Link>

                          <Link
                            to={`/reports/${healthCheck.id}`}
                            className="rounded-2xl bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-300"
                          >
                            Open health check
                          </Link>
                        </div>
                      </div>
                    );
                  }

                  const item = entry.item;

                  return (
                    <div
                      key={`${item.reportCategory}-${item.id}`}
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
                              item.reportCategory
                            )}`}
                          >
                            {reportTypeLabel(item.reportCategory)}
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

                      {(item.reportCategory === "corrective" || item.reportCategory === "cfr") &&
                        (item.failureCode || item.failureComponent || item.failureMode) ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.failureCode ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                              {formatFailureCode(item.failureCode)}
                            </span>
                          ) : null}

                          {item.failureComponent ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                              {item.failureComponent}
                            </span>
                          ) : null}

                          {item.failureMode ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                              {item.failureMode}
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mt-4">
                        <Link
                          to={getReportLink(item)}
                          className="inline-flex rounded-2xl bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-300"
                        >
                          {getReportLinkLabel(item)}
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
                  No report history found.
                </div>
              )}
            </div>
          </section>

          <section className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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