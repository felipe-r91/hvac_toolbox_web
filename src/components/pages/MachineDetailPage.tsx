import { useMemo } from "react";
import { useParams } from "react-router-dom";

type MachineHistoryItem = {
  id: string;
  type: "preventive" | "corrective";
  date: string;
  status: "online" | "down";
  title: string;
  summary: string;
};

type MachineDetail = {
  id: string;
  vesselName: string;
  machineTag: string;
  model: string;
  type: string;
  starterType: string;
  location: string;
  serialNumber: string;
  status: "online" | "down";
  lastMaintenanceAt?: string;
  recurringFailures: {
    label: string;
    count: number;
  }[];
  history: MachineHistoryItem[];
};

const machines: MachineDetail[] = [
  {
    id: "1",
    vesselName: "MV Atlantic Star",
    machineTag: "CH-01",
    model: "VSM89",
    type: "Chiller",
    starterType: "VSD",
    location: "Engine Room",
    serialNumber: "SN-CH01-8892",
    status: "online",
    lastMaintenanceAt: "2026-03-18T14:20:00Z",
    recurringFailures: [
      { label: "Low suction pressure", count: 2 },
      { label: "Oil filter restriction", count: 1 },
    ],
    history: [
      {
        id: "r-1",
        type: "preventive",
        date: "2026-03-18T14:20:00Z",
        status: "online",
        title: "Preventive maintenance completed",
        summary: "General inspection completed and machine returned operating normally.",
      },
      {
        id: "r-2",
        type: "corrective",
        date: "2026-02-12T09:10:00Z",
        status: "down",
        title: "Corrective maintenance",
        summary: "Low suction pressure investigated and expansion valve behavior reviewed.",
      },
    ],
  },
  {
    id: "2",
    vesselName: "MV Atlantic Star",
    machineTag: "CH-02",
    model: "VSM2871",
    type: "Chiller",
    starterType: "SSS",
    location: "Engine Room",
    serialNumber: "SN-CH02-9981",
    status: "down",
    lastMaintenanceAt: "2026-03-12T09:10:00Z",
    recurringFailures: [
      { label: "Starter overload", count: 3 },
      { label: "Communication fault", count: 2 },
    ],
    history: [
      {
        id: "r-3",
        type: "corrective",
        date: "2026-03-12T09:10:00Z",
        status: "down",
        title: "Corrective maintenance",
        summary: "Starter overload condition found and further corrective action recommended.",
      },
      {
        id: "r-4",
        type: "preventive",
        date: "2026-01-28T16:00:00Z",
        status: "online",
        title: "Preventive maintenance completed",
        summary: "Routine maintenance performed with no critical findings.",
      },
    ],
  },
  {
    id: "3",
    vesselName: "MV Ocean Wind",
    machineTag: "AC-01",
    model: "VSM151",
    type: "Air Conditioning Unit",
    starterType: "EM Starter",
    location: "Accommodation Deck",
    serialNumber: "SN-AC01-4457",
    status: "online",
    lastMaintenanceAt: "2026-03-05T11:30:00Z",
    recurringFailures: [],
    history: [
      {
        id: "r-5",
        type: "preventive",
        date: "2026-03-05T11:30:00Z",
        status: "online",
        title: "Preventive maintenance completed",
        summary: "Operational check completed and all readings within normal range.",
      },
    ],
  },
];

function statusClasses(status: "online" | "down") {
  return status === "online"
    ? "bg-green-100 text-green-800 ring-green-200"
    : "bg-red-100 text-red-800 ring-red-200";
}

function reportTypeClasses(type: "preventive" | "corrective") {
  return type === "preventive"
    ? "bg-blue-100 text-blue-800"
    : "bg-yellow-100 text-yellow-800";
}

export function MachineDetailPage() {
  const { machineId } = useParams();

  const machine = useMemo(
    () => machines.find((item) => item.id === machineId),
    [machineId]
  );

  if (!machine) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Machine not found</h1>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">
          Machines / {machine.vesselName} / {machine.machineTag}
        </p>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {machine.machineTag}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {machine.vesselName} · {machine.model} · {machine.starterType} · {machine.type}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Location: {machine.location}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Serial Number: {machine.serialNumber}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusClasses(
                machine.status
              )}`}
            >
              {machine.status}
            </span>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs font-medium text-slate-500">Last maintenance</p>
              <p className="mt-1 text-sm text-slate-800">
                {machine.lastMaintenanceAt
                  ? new Date(machine.lastMaintenanceAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Reports timeline</h2>

          <div className="mt-4 space-y-4">
            {machine.history.length > 0 ? (
              machine.history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(item.date).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${reportTypeClasses(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusClasses(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">{item.summary}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
                No report history found.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recurring failures</h2>

          <div className="mt-4 space-y-3">
            {machine.recurringFailures.length > 0 ? (
              machine.recurringFailures.map((failure) => (
                <div
                  key={failure.label}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"
                >
                  <div className="text-sm text-slate-800">{failure.label}</div>
                  <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                    {failure.count}x
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
                No recurring failures registered.
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Variable trends</h3>
            <p className="mt-2 text-sm text-slate-500">
              Trend charts will be displayed here once machine variable readings are enabled.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}