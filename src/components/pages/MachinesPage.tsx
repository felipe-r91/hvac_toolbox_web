import { useMemo, useState } from "react";
import type { OfficeMachineRow } from "../../types/machine";
import { useNavigate } from "react-router-dom";

const machines: OfficeMachineRow[] = [
  {
    id: "1",
    vesselName: "MV Atlantic Star",
    machineTag: "CH-01",
    model: "VSM89",
    type: "Chiller",
    starterType: "VSD",
    location: "Engine Room",
    status: "online",
    lastMaintenanceAt: "2026-03-18T14:20:00Z",
    lastReportType: "preventive",
  },
  {
    id: "2",
    vesselName: "MV Atlantic Star",
    machineTag: "CH-02",
    model: "VSM2871",
    type: "Chiller",
    starterType: "SSS",
    location: "Engine Room",
    status: "down",
    lastMaintenanceAt: "2026-03-12T09:10:00Z",
    lastReportType: "corrective",
  },
  {
    id: "3",
    vesselName: "MV Ocean Wind",
    machineTag: "AC-01",
    model: "VSM151",
    type: "Air Conditioning Unit",
    starterType: "EM Starter",
    location: "Accommodation Deck",
    status: "online",
    lastMaintenanceAt: "2026-03-05T11:30:00Z",
    lastReportType: "preventive",
  },
];

function statusClasses(status: "online" | "down") {
  return status === "online"
    ? "bg-green-100 text-green-800 ring-green-200"
    : "bg-red-100 text-red-800 ring-red-200";
}

function reportTypeClasses(type?: "preventive" | "corrective") {
  if (type === "preventive") {
    return "bg-blue-100 text-blue-800";
  }

  if (type === "corrective") {
    return "bg-yellow-100 text-yellow-800";
  }

  return "bg-slate-100 text-slate-600";
}

export function MachinesPage() {
  const [search, setSearch] = useState("");
  const [vesselFilter, setVesselFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const navigate = useNavigate();

  const vesselOptions = useMemo(() => {
    return Array.from(new Set(machines.map((machine) => machine.vesselName))).sort();
  }, []);

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const matchesSearch =
        search.trim() === "" ||
        machine.machineTag.toLowerCase().includes(search.toLowerCase()) ||
        machine.model.toLowerCase().includes(search.toLowerCase()) ||
        machine.type.toLowerCase().includes(search.toLowerCase()) ||
        machine.location.toLowerCase().includes(search.toLowerCase()) ||
        machine.vesselName.toLowerCase().includes(search.toLowerCase());

      const matchesVessel =
        vesselFilter === "all" || machine.vesselName === vesselFilter;

      const matchesStatus =
        statusFilter === "all" || machine.status === statusFilter;

      const matchesReportType =
        reportTypeFilter === "all" || machine.lastReportType === reportTypeFilter;

      return (
        matchesSearch &&
        matchesVessel &&
        matchesStatus &&
        matchesReportType
      );
    });
  }, [search, vesselFilter, statusFilter, reportTypeFilter]);

  return (
    <section className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tag, vessel, model..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-md outline-none"
            />
          </label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 mt-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Vessel
            </span>
            <select
              value={vesselFilter}
              onChange={(e) => setVesselFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 h-10 text-md outline-none"
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
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 h-10 text-md outline-none"
            >
              <option value="all">All statuses</option>
              <option value="online">Online</option>
              <option value="down">Down</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">
              Last report
            </span>
            <select
              value={reportTypeFilter}
              onChange={(e) => setReportTypeFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 h-10 text-md outline-none"
            >
              <option value="all">All report types</option>
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
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

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Vessel</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Machine</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Model</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Location</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Last Maintenance</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Last Report</th>
              </tr>
            </thead>

            <tbody>
              {filteredMachines.length > 0 ? (
                filteredMachines.map((machine) => (
                  <tr
                    key={machine.id}
                    onClick={() => navigate(`/machines/${machine.id}`)}
                    className="cursor-pointer border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm text-slate-700">{machine.vesselName}</td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">
                        {machine.machineTag}
                      </div>
                      <div className="text-xs text-slate-500">
                        {machine.type} · {machine.starterType}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">{machine.model}</td>

                    <td className="px-6 py-4 text-sm text-slate-700">{machine.location}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusClasses(
                          machine.status
                        )}`}
                      >
                        {machine.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {machine.lastMaintenanceAt
                        ? new Date(machine.lastMaintenanceAt).toLocaleString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${reportTypeClasses(
                          machine.lastReportType
                        )}`}
                      >
                        {machine.lastReportType ?? "—"}
                      </span>
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