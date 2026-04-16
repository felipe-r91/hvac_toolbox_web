import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getVesselById } from "../../api/vesselsApi";
import { getMachineSummaryById } from "../../api/machineDetailApi";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/reports": "Reports",
  "/machines": "Machines",
  "/vessels": "Vessels",
  "/cfr-center": "CFR Center",
  "/insights": "Insights",
};

type VesselBreadcrumbData = {
  vesselName: string;
};

type MachineBreadcrumbData = {
  vesselId: string;
  vesselName: string;
  machineTag: string;
};

export function Topbar() {
  const location = useLocation();
  const { machineId, vesselId } = useParams();

  const [vesselData, setVesselData] = useState<VesselBreadcrumbData | null>(null);
  const [machineData, setMachineData] = useState<MachineBreadcrumbData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadVessel = async () => {
      if (!location.pathname.startsWith("/vessels/") || !vesselId) {
        setVesselData(null);
        return;
      }

      try {
        const vessel = await getVesselById(vesselId);

        if (!cancelled) {
          setVesselData({
            vesselName: vessel.name,
          });
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setVesselData(null);
        }
      }
    };

    loadVessel();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, vesselId]);

  useEffect(() => {
    let cancelled = false;

    const loadMachine = async () => {
      if (!location.pathname.startsWith("/machines/") || !machineId) {
        setMachineData(null);
        return;
      }

      try {
        const machine = await getMachineSummaryById(machineId);

        if (!cancelled) {
          setMachineData({
            vesselId: machine.vesselId,
            vesselName: machine.vesselName,
            machineTag: machine.machineTag,
          });
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setMachineData(null);
        }
      }
    };

    loadMachine();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, machineId]);

  if (location.pathname.startsWith("/machines/") && machineId) {
    return (
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Link to="/machines" className="text-slate-600 hover:text-slate-900">
            Machines
          </Link>

          <span className="text-slate-400">/</span>

          {machineData ? (
            <Link
              to={`/vessels/${machineData.vesselId}`}
              className="text-slate-600 hover:text-slate-900"
            >
              {machineData.vesselName}
            </Link>
          ) : (
            <span className="text-slate-400">Loading...</span>
          )}

          <span className="text-slate-400">/</span>

          <span className="text-slate-900">
            {machineData?.machineTag || machineId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            Technician / Manager
          </div>
        </div>
      </header>
    );
  }

  if (location.pathname.startsWith("/vessels/") && vesselId) {
    return (
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Link to="/vessels" className="text-slate-600 hover:text-slate-900">
            Vessels
          </Link>

          <span className="text-slate-400">/</span>

          <span className="text-slate-900">
            {vesselData?.vesselName || vesselId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            Technician / Manager
          </div>
        </div>
      </header>
    );
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