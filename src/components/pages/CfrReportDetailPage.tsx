import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCfrReportById } from "../../api/reportDetailApi";
import type { CfrDraftDetail } from "../../types/report";
import { API_BASE_URL } from "../../api/config";

function statusClasses(status?: string) {
  if (status === "online") {
    return "bg-green-100 text-green-800 ring-green-200";
  }

  if (status === "down") {
    return "bg-red-100 text-red-800 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function formatFailureCode(code?: string) {
  if (!code) return "—";

  return code
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function resolvePhotoUrl(url?: string) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_BASE_URL}${url}`;
}

function DetailSection({
  title,
  value,
}: {
  title: string;
  value?: string;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
        {value?.trim() || "—"}
      </p>
    </section>
  );
}

function HeaderInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-sm font-medium text-slate-900">
        {value}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="text-xs font-medium text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-sm font-medium text-slate-900">
        {value}
      </div>
    </div>
  );
}

export function CfrReportDetailPage() {
  const { reportId } = useParams();

  const [report, setReport] = useState<CfrDraftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reportId) return;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCfrReportById(reportId);
        setReport(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load CFR report.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [reportId]);

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">
          Loading CFR report...
        </p>
      </section>
    );
  }

  if (error || !report) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-red-600">
          {error || "CFR report not found."}
        </p>
      </section>
    );
  }

  const isMachineDown = report.machineStatus === "down";

  const headerPhoto =
    report.photos.find((photo) => photo.previewUrl)?.previewUrl || "";

  return (
    <section className="flex h-[calc(100vh-8.5rem)] min-h-0 flex-col gap-4">
      {/* Header */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Conditions Found Report
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                  CFR
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusClasses(
                    report.machineStatus
                  )}`}
                >
                  {report.machineStatus}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <HeaderInfo
                label="Vessel"
                value={report.vesselName}
              />

              <HeaderInfo
                label="Machine"
                value={report.machineTag}
              />

              <HeaderInfo
                label="Model"
                value={`${report.machineModel} · ${report.machineStarterType}`}
              />

              <HeaderInfo
                label="Location"
                value={report.machineLocation}
              />
            </div>
          </div>

          <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-slate-200">
            {headerPhoto ? (
              <img
                src={resolvePhotoUrl(headerPhoto)}
                alt={report.machineTag}
                className="h-full max-h-80 w-full object-cover"
              />
            ) : (
              <div className="px-6 text-center text-sm text-slate-400">
                No machine photo available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Scrollable content */}
      <section className="min-h-0 flex-1 overflow-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-4">
          {isMachineDown ? (
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Failure Classification
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <InfoCard
                  label="Failure component"
                  value={report.failureComponent || "—"}
                />

                <InfoCard
                  label="Failure mode"
                  value={report.failureMode || "—"}
                />

                <InfoCard
                  label="Failure code"
                  value={formatFailureCode(report.failureCode)}
                />
              </div>
            </section>
          ) : null}

          <DetailSection
            title="Condition Found"
            value={report.conditionFound}
          />

          {isMachineDown ? (
            <>
              <DetailSection
                title="Symptoms Observed"
                value={report.symptomsObserved}
              />

              <DetailSection
                title="Alarms / Abnormal Readings"
                value={report.alarmsObserved}
              />

              <DetailSection
                title="Operational Impact"
                value={report.operationalImpact}
              />

              <DetailSection
                title="Preliminary Diagnosis"
                value={report.preliminaryDiagnosis}
              />

              <DetailSection
                title="Confirmed Cause"
                value={report.confirmedCause}
              />
            </>
          ) : (
            <DetailSection
              title="Alarms / Abnormal Readings"
              value={report.alarmsObserved}
            />
          )}

          <DetailSection
            title="Recommendations"
            value={report.recommendations}
          />

          <DetailSection
            title="Further Action Required"
            value={report.furtherActionRequired}
          />

          {/* Photos */}
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Photos
            </h2>

            {report.photos.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {report.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
                  >
                    <img
                      src={resolvePhotoUrl(photo.previewUrl)}
                      alt={photo.caption || "CFR photo"}
                      className="h-56 w-full rounded-2xl object-cover"
                    />

                    <p className="mt-3 text-sm text-slate-700">
                      {photo.caption || "No caption"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {photo.filename}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
                No photos attached.
              </div>
            )}
          </section>
        </div>
      </section>
    </section>
  );
}