import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getVesselById } from "../../api/vesselsApi";
import type { OfficeVessel } from "../../types/vessel";

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

type VesselMachineView = {
  id: string;
  machineTag: string;
  model: string;
  type: string;
  starterType: string;
  location: string;
  status: "online" | "down";
  lastMaintenanceAt?: string;
  lastReportType?: "preventive" | "corrective";
};

export function VesselDetailPage() {
  const { vesselId } = useParams();
  const [vessel, setVessel] = useState<OfficeVessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vesselId) return;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getVesselById(vesselId);
        setVessel(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load vessel.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [vesselId]);

  const machineRows: VesselMachineView[] = useMemo(() => {
    if (!vessel) return [];

    return vessel.machines.map((machine) => ({
      id: machine.id,
      machineTag: machine.tag,
      model: machine.model,
      type: machine.type,
      starterType: machine.starterType,
      location: machine.location,
      status: "online",
      lastMaintenanceAt: undefined,
      lastReportType: undefined,
    }));
  }, [vessel]);

  const metrics = useMemo(() => {
    const totalMachines = machineRows.length;
    const onlineMachines = machineRows.filter((m) => m.status === "online").length;
    const downMachines = machineRows.filter((m) => m.status === "down").length;
    const correctiveOpen = machineRows.filter(
      (m) => m.lastReportType === "corrective" && m.status === "down"
    ).length;

    const preventiveDueSoon = machineRows.filter((m) => {
      if (!m.lastMaintenanceAt) return true;

      const last = new Date(m.lastMaintenanceAt).getTime();
      const now = Date.now();
      const days = (now - last) / (1000 * 60 * 60 * 24);

      return days >= 25;
    }).length;

    const availability =
      totalMachines > 0 ? Math.round((onlineMachines / totalMachines) * 100) : 0;

    return {
      totalMachines,
      onlineMachines,
      downMachines,
      availability,
      preventiveDueSoon,
      correctiveOpen,
    };
  }, [machineRows]);

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Loading vessel...</h1>
      </section>
    );
  }

  if (error || !vessel) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Vessel not found</h1>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Vessels / {vessel.name}</p>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{vessel.name}</h1>
            <p className="mt-2 text-sm text-slate-500">IMO: {vessel.imoNumber}</p>
            {vessel.description ? (
              <p className="mt-2 text-sm text-slate-500">{vessel.description}</p>
            ) : null}
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
            <p className="text-xs font-medium text-slate-500">Machine availability</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {metrics.availability}%
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Total Machines</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {metrics.totalMachines}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Online</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {metrics.onlineMachines}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Down</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {metrics.downMachines}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Preventive Due Soon</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {metrics.preventiveDueSoon}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Corrective Open</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {metrics.correctiveOpen}
          </p>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Machines in vessel</h2>
        <p className="mt-1 text-sm text-slate-500">
          Current machine registry for this vessel.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr className="text-left">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Machine</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Model</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Location</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Last Maintenance</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Last Report</th>
              </tr>
            </thead>

            <tbody>
              {machineRows.map((machine) => (
                <tr
                  key={machine.id}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <Link to={`/machines/${machine.id}`} className="block">
                      <div className="text-sm font-semibold text-slate-900">
                        {machine.machineTag}
                      </div>
                      <div className="text-xs text-slate-500">
                        {machine.type} · {machine.starterType}
                      </div>
                    </Link>
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
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}