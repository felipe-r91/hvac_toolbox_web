import { useEffect, useMemo, useState } from "react";
import { FaDownload, FaFilePdf, FaSpinner } from "react-icons/fa";
import {
  downloadCustomerReportPdf,
  findCustomerReports,
  type CustomerReportResponse,
} from "../../api/customerReportApi";

type CustomerReport = CustomerReportResponse;

function statusClasses(status?: string) {
  if (status === "online") {
    return "bg-green-100 text-green-800 ring-green-200";
  }

  if (status === "down") {
    return "bg-red-100 text-red-800 ring-red-200";
  }

  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function reportTypeClasses(type?: "health_check" | "corrective" | "cfr") {
  if (type === "health_check") {
    return "bg-blue-100 text-blue-800";
  }

  if (type === "corrective") {
    return "bg-yellow-100 text-yellow-800";
  }

  if (type === "cfr") {
    return "bg-purple-100 text-purple-800";
  }

  return "bg-slate-100 text-slate-600";
}

function reportTypeLabel(type?: "health_check" | "corrective" | "cfr") {
  if (type === "health_check") return "Health Check";
  if (type === "corrective") return "Corrective";
  if (type === "cfr") return "CFR";
  return "PDF Report";
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function getDisplayName(report: CustomerReport) {
  return report.pdfFilename || report.title || `customer-report-${report.id}.pdf`;
}

export function ReportsPage() {
  const [reports, setReports] = useState<CustomerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [vesselFilter, setVesselFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await findCustomerReports();
        setReports(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const vesselOptions = useMemo(() => {
    return Array.from(
      new Set(
        reports
          .map((report) => report.vesselName)
          .filter((vesselName): vesselName is string => Boolean(vesselName))
      )
    ).sort();
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        term === "" ||
        report.title?.toLowerCase().includes(term) ||
        report.pdfFilename?.toLowerCase().includes(term) ||
        report.vesselName?.toLowerCase().includes(term) ||
        report.machineTag?.toLowerCase().includes(term) ||
        report.machineModel?.toLowerCase().includes(term) ||
        report.machineType?.toLowerCase().includes(term);

      const matchesVessel =
        vesselFilter === "all" || report.vesselName === vesselFilter;

      const matchesStatus =
        statusFilter === "all" || report.machineStatus === statusFilter;

      const matchesReportType =
        reportTypeFilter === "all" || report.sourceReportType === reportTypeFilter;

      return matchesSearch && matchesVessel && matchesStatus && matchesReportType;
    });
  }, [reports, search, vesselFilter, statusFilter, reportTypeFilter]);

  async function handleDownload(report: CustomerReport) {
    try {
      setDownloadingId(report.id);
      await downloadCustomerReportPdf(report.id, getDisplayName(report));
    } catch (err) {
      console.error(err);
      window.alert("Failed to download report.");
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Loading reports...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="flex h-[calc(100vh-8.5rem)] min-h-0 flex-col gap-4">
      <section className="sticky top-0 z-20 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Report, vessel, machine..."
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
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-md outline-none"
            >
              <option value="all">All statuses</option>
              <option value="online">Online</option>
              <option value="down">Down</option>
              <option value="unknown">Unknown</option>
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
              <option value="health_check">Health Check</option>
              <option value="corrective">Corrective</option>
              <option value="cfr">CFR</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing {filteredReports.length} report{filteredReports.length === 1 ? "" : "s"}
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setVesselFilter("all");
              setStatusFilter("all");
              setReportTypeFilter("all");
            }}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Clear filters
          </button>
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="h-full overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="text-left">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Report</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Vessel</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Machine</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Type</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Download</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => {
                  const isDownloading = downloadingId === report.id;

                  return (
                    <tr
                      key={report.id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                            <FaFilePdf />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              {report.title || getDisplayName(report)}
                            </div>
                            <div className="truncate text-xs text-slate-500">
                              {report.pdfFilename || "PDF file"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {report.vesselName || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {report.machineTag || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {[report.machineType, report.machineModel]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusClasses(
                            report.machineStatus || "unknown"
                          )}`}
                        >
                          {report.machineStatus || "unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatDate(report.reportDate || report.createdAt)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${reportTypeClasses(
                            report.sourceReportType
                          )}`}
                        >
                          {reportTypeLabel(report.sourceReportType)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownload(report)}
                          disabled={isDownloading}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isDownloading ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaDownload />
                          )}
                          {isDownloading ? "Preparing..." : "Download"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No reports found for the current filters.
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
