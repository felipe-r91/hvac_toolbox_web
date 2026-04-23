import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMachineSummaries } from "../../api/machinesApi";
import type { OfficeMachineSummary } from "../../types/machine";

function statusClasses(status: "online" | "down" | "unknown") {
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
  return "—";
}

export function MachinesPage() {
  const navigate = useNavigate();

  const [machines, setMachines] = useState<OfficeMachineSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [vesselFilter, setVesselFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMachineSummaries();
        setMachines(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load machines.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const vesselOptions = useMemo(() => {
    return Array.from(new Set(machines.map((machine) => machine.vesselName))).sort();
  }, [machines]);

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        term === "" ||
        machine.machineTag.toLowerCase().includes(term) ||
        machine.model.toLowerCase().includes(term) ||
        machine.type.toLowerCase().includes(term) ||
        machine.location.toLowerCase().includes(term) ||
        machine.vesselName.toLowerCase().includes(term) ||
        machine.serialNumber.toLowerCase().includes(term);

      const matchesVessel =
        vesselFilter === "all" || machine.vesselName === vesselFilter;

      const matchesStatus =
        statusFilter === "all" || machine.latestKnownStatus === statusFilter;

      const matchesReportType =
        reportTypeFilter === "all" || machine.latestReportType === reportTypeFilter;

      return (
        matchesSearch &&
        matchesVessel &&
        matchesStatus &&
        matchesReportType
      );
    });
  }, [machines, search, vesselFilter, statusFilter, reportTypeFilter]);

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Loading machines...</p>
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
              placeholder="Tag, vessel, model..."
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
              Last report
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
            Showing {filteredMachines.length} machine{filteredMachines.length === 1 ? "" : "s"}
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
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Vessel</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Machine</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Model</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Location</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Last Activity</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Last Report</th>
              </tr>
            </thead>

            <tbody>
              {filteredMachines.length > 0 ? (
                filteredMachines.map((machine) => (
                  <tr
                    key={machine.machineId}
                    onClick={() => navigate(`/machines/${machine.machineId}`)}
                    className="cursor-pointer border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {machine.vesselName}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        {machine.machineTag}
                      </div>
                      <div className="text-xs text-slate-500">
                        {machine.type} · {machine.starterType}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {machine.model}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {machine.location}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusClasses(
                          machine.latestKnownStatus || "unknown"
                        )}`}
                      >
                        {machine.latestKnownStatus || "unknown"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {machine.latestReportDate
                        ? new Date(machine.latestReportDate).toLocaleString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${reportTypeClasses(
                            machine.latestReportType
                          )}`}
                        >
                          {reportTypeLabel(machine.latestReportType)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No machines found for the current filters.
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