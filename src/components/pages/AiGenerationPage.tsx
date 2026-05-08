import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type DraftReportRow,
  type DraftReportType,
  generateAiReport,
  getAiGenerationDrafts,
} from "../../api/aiGenerationApi";

function typeLabel(type: DraftReportType) {
  if (type === "cfr") {
    return "CFR";
  }

  if (type === "corrective") {
    return "Corrective";
  }

  return "Health Check";
}

function typeClasses(type: DraftReportType) {
  if (type === "cfr") {
    return "bg-blue-100 text-blue-800";
  }

  if (type === "corrective") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-green-100 text-green-800";
}

function formatDate(value: string) {
  if (!value) {
    return "Not informed";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function AiGenerationPage() {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<DraftReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const hasDrafts = useMemo(() => drafts.length > 0, [drafts]);

  useEffect(() => {
    let active = true;

    async function loadDrafts() {
      try {
        setLoading(true);
        setError("");

        const data = await getAiGenerationDrafts();

        if (active) {
          setDrafts(data);
        }
      } catch (err) {
        console.error(err);

        if (active) {
          setError("Unable to load draft reports.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDrafts();

    return () => {
      active = false;
    };
  }, []);

  async function handleGenerate(draft: DraftReportRow) {
    if (draft.type === "preventive") {
      return;
    }

    try {
      setGeneratingId(draft.id);
      setError("");

      const generatedReport = await generateAiReport(
        draft.type,
        draft.id
      );

      if (draft.type === "cfr") {
        navigate("/ai-generation-service/cfr/preview", {
          state: {
            report: generatedReport,
            previewComponent: "ConditionsFoundReportUI",
          },
        });

        return;
      }

      if (draft.type === "corrective") {
        navigate("/ai-generation-service/corrective/preview", {
          state: {
            report: generatedReport,
            previewComponent: "ServiceReportUI",
          },
        });
      }
    } catch (err) {
      console.error(err);
      setError("Unable to generate AI report.");
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              AI Reports
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              AI Generation
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Generate AI-powered customer reports from draft CFR,
              Corrective, and Health Check reports.
            </p>
          </div>
        </header>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Draft Reports
            </h2>
          </div>

          {error && (
            <div className="m-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading draft reports...
            </div>
          ) : !hasDrafts ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No draft reports found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Vessel
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Machine
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Type
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Date
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {drafts.map((draft) => {
                    const isPreventive = draft.type === "preventive";
                    const isGenerating = generatingId === draft.id;

                    return (
                      <tr
                        key={`${draft.type}-${draft.id}`}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">
                          {draft.vessel}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                          {draft.machine}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${typeClasses(
                              draft.type
                            )}`}
                          >
                            {typeLabel(draft.type)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                          {formatDate(draft.date)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <button
                            type="button"
                            disabled={isPreventive || isGenerating}
                            onClick={() => handleGenerate(draft)}
                            className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                          >
                            {isPreventive
                              ? "Coming Soon"
                              : isGenerating
                              ? "Generating..."
                              : "Generate with AI"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
