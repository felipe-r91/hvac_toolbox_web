import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getVesselById } from "../../api/vesselsApi";
import { getMachineSummaries } from "../../api/machinesApi";
import type { OfficeVessel } from "../../types/vessel";
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

function formatRepportType(type?: "health_check" | "corrective" | "cfr") {
  if (type === "health_check") {
    return "Health Check";
  }

  if (type === "corrective") {
    return "Corrective";
  }

  if (type === "cfr") {
    return "CFR";
  }

  return "—";
}

export function VesselDetailPage() {
  const { vesselId } = useParams();

  const [vessel, setVessel] = useState<OfficeVessel | null>(null);
  const [machineSummaries, setMachineSummaries] = useState<OfficeMachineSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vesselId) return;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const [vesselData, machineSummaryData] = await Promise.all([
          getVesselById(vesselId),
          getMachineSummaries(),
        ]);

        setVessel(vesselData);
        setMachineSummaries(machineSummaryData);
      } catch (err) {
        console.error(err);
        setError("Failed to load vessel.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [vesselId]);

  const vesselMachines = useMemo(() => {
    if (!vessel) return [];

    return machineSummaries
      .filter((machine) => machine.vesselId === vessel.id)
      .sort((a, b) => a.machineTag.localeCompare(b.machineTag));
  }, [vessel, machineSummaries]);

  const metrics = useMemo(() => {
    const totalMachines = vesselMachines.length;
    const onlineMachines = vesselMachines.filter(
      (m) => m.latestKnownStatus === "online"
    ).length;
    const downMachines = vesselMachines.filter(
      (m) => m.latestKnownStatus === "down"
    ).length;
    const unknownMachines = vesselMachines.filter(
      (m) => !m.latestKnownStatus || m.latestKnownStatus === "unknown"
    ).length;

    const correctiveOpen = vesselMachines.filter(
      (m) => m.latestReportType === "corrective" && m.latestKnownStatus === "down"
    ).length;

    const preventiveDueSoon = vesselMachines.filter((m) => {
      if (!m.latestReportDate || m.latestReportType !== "health_check") {
        return true;
      }

      const last = new Date(m.latestReportDate).getTime();
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
      unknownMachines,
      availability,
      preventiveDueSoon,
      correctiveOpen,
    };
  }, [vesselMachines]);

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Loading vessel...</p>
      </section>
    );
  }

  if (error || !vessel) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-red-600">{error || "Vessel not found."}</p>
      </section>
    );
  }

  return (
    <section className="flex h-[calc(100vh-8.5rem)] min-h-0 flex-col gap-4">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Vessel</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{vessel.name}</h1>
            <p className="mt-3 text-sm text-slate-500">IMO: {vessel.imoNumber}</p>
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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
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
          <p className="text-sm text-slate-500">Unknown</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {metrics.unknownMachines}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Preventive Due Soon</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {metrics.preventiveDueSoon}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:col-span-2 xl:col-span-1">
          <p className="text-sm text-slate-500">Corrective Open</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {metrics.correctiveOpen}
          </p>
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="h-full overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="text-left">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Machine</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Model</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Location</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Last Activity</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Last Report</th>
              </tr>
            </thead>

            <tbody>
              {vesselMachines.length > 0 ? (
                vesselMachines.map((machine) => (
                  <tr
                    key={machine.machineId}
                    className="border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <Link to={`/machines/${machine.machineId}`} className="block">
                        <div className="text-sm font-semibold text-slate-900">
                          {machine.machineTag}
                        </div>
                        <div className="text-xs text-slate-500">
                          {machine.type} · {machine.starterType}
                        </div>
                      </Link>
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
                          {formatRepportType(machine.latestReportType)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No machines found for this vessel.
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