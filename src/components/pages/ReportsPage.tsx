import { useEffect, useMemo, useState } from "react";
import {
  FaDownload,
  FaFilePdf,
  FaRedo,
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { API_BASE_URL } from "../../api/config";

type CustomerReport = {
  id: string;
  sourceReportId?: string;
  sourceReportType?: string;
  vesselId?: string;
  vesselName?: string;
  machineId?: string;
  machineTag?: string;
  machineModel?: string;
  machineType?: string;
  machineStatus?: string;
  title?: string;
  reportDate?: string;
  pdfFilename?: string;
  createdAt?: string;
};


function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getDisplayName(report: CustomerReport) {
  return report.pdfFilename || report.title || `customer-report-${report.id}.pdf`;
}

export function ReportsPage() {
  const [reports, setReports] = useState<CustomerReport[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return reports;

    return reports.filter((report) => {
      const searchableText = [
        report.id,
        report.title,
        report.pdfFilename,
        report.sourceReportType,
        report.vesselName,
        report.machineTag,
        report.machineModel,
        report.machineType,
        report.machineStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(value);
    });
  }, [reports, search]);

  async function loadReports() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/customer-reports`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load saved reports.");
      }

      const data = (await response.json()) as CustomerReport[];
      setReports(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error loading reports.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadReport(report: CustomerReport) {
    try {
      setDownloadingKey(report.id);

      const response = await fetch(
        `${API_BASE_URL}/customer-reports/${encodeURIComponent(report.id)}/download-url`,
        {
          method: "GET",
          headers: {
            Accept: "text/plain",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to generate download link.");
      }

      const downloadUrl = await response.text();

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = getDisplayName(report);
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unexpected error downloading report.");
    } finally {
      setDownloadingKey(null);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Customer Reports
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">Saved Reports</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Download PDF reports stored in the R2 bucket.
              </p>
            </div>

            <button
              type="button"
              onClick={loadReports}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaRedo />}
              Refresh
            </button>
          </div>
        </header>

        <section className="border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by report, customer, vessel..."
                className="w-full border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <p className="text-sm text-slate-500">
              {filteredReports.length} of {reports.length} reports
            </p>
          </div>
        </section>

        {error && (
          <section className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Could not load reports</p>
              <p>{error}</p>
            </div>
          </section>
        )}

        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
              <FaSpinner className="animate-spin" />
              Loading reports...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <FaFilePdf className="text-4xl text-slate-300" />
              <h2 className="mt-3 text-base font-semibold text-slate-800">No reports found</h2>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Saved PDF reports will appear here after they are uploaded to the R2 bucket.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Report</th>
                    <th className="px-4 py-3">Customer / Vessel</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredReports.map((report) => {
                    const isDownloading = downloadingKey === report.id;

                    return (
                      <tr key={report.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-red-50 text-red-600">
                              <FaFilePdf />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {getDisplayName(report)}
                              </p>
                              <p className="truncate text-xs text-slate-500">{report.title || report.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          <p className="font-medium">{report.vesselName || "—"}</p>
                          <p className="text-xs text-slate-500">{report.machineTag || report.machineModel || "—"}</p>
                        </td>

                        <td className="px-4 py-3 text-slate-600">{report.sourceReportType || "PDF Report"}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(report.reportDate || report.createdAt)}</td>
                        <td className="px-4 py-3 text-slate-600">—</td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => downloadReport(report)}
                            disabled={isDownloading}
                            className="inline-flex items-center justify-center gap-2 bg-blue-800 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                            Download
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
