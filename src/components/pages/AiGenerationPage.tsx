import { useEffect, useMemo, useState } from "react";
import { FaMagic, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/config";
import {
  type DraftReportRow,
  type DraftReportType,
  generateAiReport,
  getAiGenerationDrafts,
} from "../../api/aiGenerationApi";
import type {
  AiCustomerReport,
  SourceCfrReport,
} from "./ConditionsFoundReportUI";
import type {
  AiServiceReport,
  SourceServiceReport,
} from "./ServiceReportUI";
import type {
  AiDailyReport,
  SourceDailyReport,
} from "./DailyReportUI";

function typeLabel(type: DraftReportType) {
  if (type === "cfr") return "CFR";
  if (type === "service_report") return "Service";
  if (type === "daily") return "Daily";
  return "Machine Maintenance";
}

function typeClasses(type: DraftReportType) {
  if (type === "cfr") return "bg-purple-100 text-purple-800";
  if (type === "service_report") return "bg-yellow-100 text-yellow-800";
  if (type === "daily") return "bg-emerald-100 text-emerald-800";
  return "bg-blue-100 text-blue-800";
}

function reportTypePath(type: DraftReportType) {
  if (type === "machine_maintenance") {
    return "machine_maintenance";
  }

  return type === "service_report" ? "service-report" : type;
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

async function getSourceReport<T>(type: DraftReportType, id: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/reports/${reportTypePath(type)}/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load source report. Status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function AiGenerationPage() {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<DraftReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [vesselFilter, setVesselFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");

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
          setError("Failed to load draft reports.");
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

  const vesselOptions = useMemo(() => {
    return Array.from(
      new Set(
        drafts
          .map((draft) => draft.vessel)
          .filter((vessel): vessel is string => Boolean(vessel && vessel !== "Not informed"))
      )
    ).sort();
  }, [drafts]);

  const filteredDrafts = useMemo(() => {
    return drafts.filter((draft) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        term === "" ||
        draft.vessel.toLowerCase().includes(term) ||
        draft.machine.toLowerCase().includes(term) ||
        draft.type.toLowerCase().includes(term);

      const matchesVessel =
        vesselFilter === "all" || draft.vessel === vesselFilter;

      const matchesReportType =
        reportTypeFilter === "all" || draft.type === reportTypeFilter;

      return matchesSearch && matchesVessel && matchesReportType;
    });
  }, [drafts, search, vesselFilter, reportTypeFilter]);

  async function handleGenerate(draft: DraftReportRow) {
    if (draft.type === "machine_maintenance") {
      return;
    }

    try {
      setGeneratingId(draft.id);
      setError("");

      if (draft.type === "cfr") {
        const [sourceReport, aiReport] = await Promise.all([
          getSourceReport<SourceCfrReport>("cfr", draft.id),
          generateAiReport("cfr", draft.id) as Promise<AiCustomerReport>,
        ]);

        navigate(`/ai-generation-service/cfr/${draft.id}`, {
          state: {
            reportType: "cfr",
            sourceReport,
            aiReport,
          },
        });

        return;
      }

      if (draft.type === "service_report") {
        const [sourceReport, aiReport] = await Promise.all([
          getSourceReport<SourceServiceReport>("service_report", draft.id),
          generateAiReport("service_report", draft.id) as Promise<AiServiceReport>,
        ]);

        navigate(`/ai-generation-service/service-report/${draft.id}`, {
          state: {
            reportType: "service_report",
            sourceReport,
            aiReport,
          },
        });
      }

      if (draft.type === "daily") {
        const [sourceReport, aiReport] = await Promise.all([
          getSourceReport<SourceDailyReport>("daily", draft.id),
          generateAiReport("daily", draft.id) as Promise<AiDailyReport>,
        ]);

        navigate(`/ai-generation-service/daily/${draft.id}`, {
          state: {
            reportType: "daily",
            sourceReport,
            aiReport,
          },
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate AI report.");
    } finally {
      setGeneratingId(null);
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Loading draft reports...</p>
      </section>
    );
  }

  if (error && drafts.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="flex h-[calc(100vh-8.5rem)] min-h-0 flex-col gap-4">
      <section className="sticky top-0 z-20 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Vessel, machine, report type..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-md outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Vessel
            </span>
            <select
              value={vesselFilter}
              onChange={(e) => setVesselFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-md outline-none"
            >
              <option value="all">All vessels</option>
              {vesselOptions.map((vessel) => (
                <option key={vessel} value={vessel}>
                  {vessel}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Report type
            </span>
            <select
              value={reportTypeFilter}
              onChange={(e) => setReportTypeFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-md outline-none"
            >
              <option value="all">All report types</option>
              <option value="machine_maintenance">Machine Maintenance</option>
              <option value="service_report">Service</option>
              <option value="daily">Daily</option>
              <option value="cfr">CFR</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing {filteredDrafts.length} draft{filteredDrafts.length === 1 ? "" : "s"}
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setVesselFilter("all");
              setReportTypeFilter("all");
            }}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Clear filters
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      <section className="min-h-0 flex-1 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="h-full overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="text-left">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Vessel
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Machine
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Type
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Date
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredDrafts.length > 0 ? (
                filteredDrafts.map((draft) => {
                  const isMachineMaintenance = draft.type === "machine_maintenance";
                  const isGenerating = generatingId === draft.id;

                  return (
                    <tr
                      key={`${draft.type}-${draft.id}`}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {draft.vessel || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm text-slate-900">
                              {draft.machine || "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${typeClasses(
                            draft.type
                          )}`}
                        >
                          {typeLabel(draft.type)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatDate(draft.date)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleGenerate(draft)}
                          disabled={isMachineMaintenance || isGenerating}
                          className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isGenerating ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaMagic />
                          )}
                          {isMachineMaintenance
                            ? "Coming soon"
                            : isGenerating
                            ? "Generating..."
                            : "Generate AI"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No draft reports found for the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
