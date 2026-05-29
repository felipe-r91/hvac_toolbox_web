import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDailyReportById } from "../../api/reportDetailApi";
import type { DailyReportDetail } from "../../types/report";
import { API_BASE_URL } from "../../api/config";
import { VscSparkle } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";

function resolvePhotoUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
}

function formatFailureCode(code?: string) {
  if (!code) return "—";

  return code
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
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
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>();
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
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
        onError={() => setFailedSrc(src)}
      />
    </div>
  );
}

export function DailyReportDetailPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState<DailyReportDetail | null>(null);
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
        setReport(await getDailyReportById(reportId));
      } catch (err) {
        console.error(err);
        setError("Failed to load daily report.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [reportId]);

  useEffect(() => {
    if (!aiLoading) return;

    setAiProgress(8);
    setAiStep("Preparing daily report data...");

    const steps = [
      { progress: 18, text: "Reading daily work notes..." },
      { progress: 32, text: "Reviewing fault classification..." },
      { progress: 46, text: "Checking alarm status..." },
      { progress: 62, text: "Building daily report narrative..." },
      { progress: 78, text: "Generating customer-ready daily report..." },
      { progress: 90, text: "Formatting daily report sections..." },
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

  if (loading) return <CardText text="Loading daily report..." />;
  if (error || !report) {
    return <CardText text={error || "Daily report not found."} error />;
  }

  const headerPhoto = report.machinePhotoPreviewUrl || "";

  async function handleGenerateAiReport() {
    if (!report?.id || aiLoading) return;

    try {
      setAiLoading(true);
      setAiProgress(5);
      setAiStep("Starting AI generation...");

      const response = await fetch(
        `${API_BASE_URL}/api/ai-reports/daily/${report.id}/generate`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setAiProgress(96);
      setAiStep("Receiving generated daily report...");

      const aiReport = await response.json();

      setAiProgress(100);
      setAiStep("Daily report generated successfully.");

      window.setTimeout(() => {
        navigate(`/ai-generation-service/daily/${report.id}`, {
          state: {
            reportType: "daily",
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
    <section className="flex h-[calc(100vh-8.5rem)] min-h-0 flex-col gap-4">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Daily Report
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                  Daily
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    report.alarmPresent
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {report.alarmPresent ? "Alarm present" : "No alarm"}
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
            wrapperClassName="flex min-h-64 items-center justify-center rounded-3xl ring-1 ring-slate-200"
            className="h-full max-h-80 w-full object-cover"
            emptyText="No machine photo available"
          />
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-4">
          {report.alarmPresent ? (
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Alarm / Failure Classification
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <InfoCard label="Component" value={report.failureComponent || "—"} />
                <InfoCard label="Mode" value={report.failureMode || "—"} />
                <InfoCard label="Code" value={formatFailureCode(report.failureCode)} />
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
                {report.failureNotes?.trim() || "No failure notes provided."}
              </p>
            </section>
          ) : null}

          <DetailSection title="Work Conducted Today" value={report.workConductedToday} />
          <DetailSection title="Further Actions" value={report.furtherActions} />

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Photos</h2>

            {report.photos.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {report.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
                  >
                    <LoadingImage
                      src={resolvePhotoUrl(photo.previewUrl)}
                      alt={photo.caption || "Daily report photo"}
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
    </section>
  );
}

function DetailSection({ title, value }: { title: string; value?: string }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
        {value?.trim() || "—"}
      </p>
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
