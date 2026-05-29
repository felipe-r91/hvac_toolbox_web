import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCfrReportById } from "../../api/reportDetailApi";
import type { CfrDraftDetail } from "../../types/report";
import { API_BASE_URL } from "../../api/config";
import { VscSparkle } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";

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

export function CfrReportDetailPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState<CfrDraftDetail | null>(null);
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

  useEffect(() => {
    if (!aiLoading) return;

    setAiProgress(8);
    setAiStep("Preparing report data...");

    const steps = [
      { progress: 18, text: "Reading CFR notes..." },
      { progress: 32, text: "Reviewing machine information..." },
      { progress: 46, text: "Searching relevant manual references..." },
      { progress: 62, text: "Building engineering analysis..." },
      { progress: 78, text: "Generating customer-ready report..." },
      { progress: 90, text: "Formatting report sections..." },
    ];

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
  }, [aiLoading]);

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

  const headerPhoto = report.machinePhotoPreviewUrl || "";

  async function handleGenerateAiReport() {
    if (!report?.id || aiLoading) return;

    try {
      setAiLoading(true);
      setAiProgress(5);
      setAiStep("Starting AI generation...");

      const response = await fetch(`${API_BASE_URL}/api/ai-reports/cfr/${report.id}/generate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setAiProgress(96);
      setAiStep("Receiving generated report...");

      const aiReport = await response.json();

      setAiProgress(100);
      setAiStep("Report generated successfully.");

      window.setTimeout(() => {
        navigate(`/ai-generation-service/cfr/${report.id}`, {
          state: {
            reportType: "cfr",
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
                    <LoadingImage
                      src={resolvePhotoUrl(photo.previewUrl)}
                      alt={photo.caption || "CFR photo"}
                      wrapperClassName="h-56 w-full rounded-2xl"
                      className="h-56 w-full rounded-2xl object-cover"
                      emptyText="Photo unavailable"
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
  );
}
