import { Link, useLocation, useParams } from "react-router-dom";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/reports": "Reports",
  "/machines": "Machines",
  "/vessels": "Vessels",
  "/cfr-center": "CFR Center",
  "/insights": "Insights",
};

const vesselBreadcrumbs: Record<string, { vesselName: string }> = {
  v1: { vesselName: "MV Atlantic Star" },
  v2: { vesselName: "MV Ocean Wind" },
};

const machineBreadcrumbs: Record<
  string,
  { vesselId: string; vesselName: string; machineTag: string }
> = {
  "1": { vesselId: "v1", vesselName: "MV Atlantic Star", machineTag: "CH-01" },
  "2": { vesselId: "v1", vesselName: "MV Atlantic Star", machineTag: "CH-02" },
  "3": { vesselId: "v2", vesselName: "MV Ocean Wind", machineTag: "AC-01" },
  "4": { vesselId: "v1", vesselName: "MV Atlantic Star", machineTag: "AC-05" },
  "5": { vesselId: "v2", vesselName: "MV Ocean Wind", machineTag: "BR-01" },
};

export function Topbar() {
  const location = useLocation();
  const { machineId, vesselId } = useParams();

  if (location.pathname.startsWith("/machines/") && machineId) {
    const machine = machineBreadcrumbs[machineId];

    if (machine) {
      return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Link to="/machines" className="text-slate-600 hover:text-slate-900">
              Machines
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              to={`/vessels/${machine.vesselId}`}
              className="text-slate-600 hover:text-slate-900"
            >
              {machine.vesselName}
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900">{machine.machineTag}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Technician / Manager
            </div>
          </div>
        </header>
      );
    }
  }

  if (location.pathname.startsWith("/vessels/") && vesselId) {
    const vessel = vesselBreadcrumbs[vesselId];

    if (vessel) {
      return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Link to="/vessels" className="text-slate-600 hover:text-slate-900">
              Vessels
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900">{vessel.vesselName}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Technician / Manager
            </div>
          </div>
        </header>
      );
    }
  }

  const title = routeTitles[location.pathname] ?? "HVAC Toolbox";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
          Technician / Manager
        </div>
      </div>
    </header>
  );
}