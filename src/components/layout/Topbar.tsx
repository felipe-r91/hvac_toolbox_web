import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getVesselById } from "../../api/vesselsApi";
import { getMachineSummaryById } from "../../api/machineDetailApi";
import {
  getCfrReportById,
  getCorrectiveReportById,
  getHealthCheckReportById,
} from "../../api/reportDetailApi";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/reports": "Reports",
  "/machines": "Machines",
  "/vessels": "Vessels",
  "/ai-generation": "AI Generation",
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

type ReportBreadcrumbData = {
  vesselId: string;
  vesselName: string;
  machineId: string;
  machineTag: string;
  reportLabel: string;
};

function UserBadge() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        Technician / Manager
      </div>
    </div>
  );
}

export function Topbar() {
  const location = useLocation();
  const { machineId, vesselId } = useParams();

  const [vesselData, setVesselData] = useState<VesselBreadcrumbData | null>(null);
  const [machineData, setMachineData] = useState<MachineBreadcrumbData | null>(null);
  const [reportData, setReportData] = useState<ReportBreadcrumbData | null>(null);

  const isReportRoute =
    location.pathname.startsWith("/reports/") ||
    location.pathname.startsWith("/corrective-reports/") ||
    location.pathname.startsWith("/cfr-reports/");

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
        if (!cancelled) setVesselData(null);
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
        if (!cancelled) setMachineData(null);
      }
    };

    loadMachine();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, machineId]);

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      const parts = location.pathname.split("/").filter(Boolean);
      const route = parts[0];
      const reportId = parts[1];

      const isReportDetailRoute =
        route === "reports" ||
        route === "corrective-reports" ||
        route === "cfr-reports";

      if (!isReportDetailRoute || !reportId) {
        setReportData(null);
        return;
      }

      try {
        if (route === "reports") {
          const report = await getHealthCheckReportById(reportId);

          if (!cancelled) {
            setReportData({
              vesselId: report.vesselId,
              vesselName: report.vesselName,
              machineId: report.machineId,
              machineTag: report.machineTag,
              reportLabel: "Health Check Report",
            });
          }

          return;
        }

        if (route === "corrective-reports") {
          const report = await getCorrectiveReportById(reportId);

          if (!cancelled) {
            setReportData({
              vesselId: report.vesselId,
              vesselName: report.vesselName,
              machineId: report.machineId,
              machineTag: report.machineTag,
              reportLabel: "Corrective Report",
            });
          }

          return;
        }

        if (route === "cfr-reports") {
          const report = await getCfrReportById(reportId);

          if (!cancelled) {
            setReportData({
              vesselId: report.vesselId,
              vesselName: report.vesselName,
              machineId: report.machineId,
              machineTag: report.machineTag,
              reportLabel: "CFR Report",
            });
          }
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setReportData(null);
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (isReportRoute) {
    return (
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Link to="/machines" className="text-slate-600 hover:text-slate-900">
            Machines
          </Link>

          <span className="text-slate-400">/</span>

          {reportData ? (
            <Link
              to={`/vessels/${reportData.vesselId}`}
              className="text-slate-600 hover:text-slate-900"
            >
              {reportData.vesselName}
            </Link>
          ) : (
            <span className="text-slate-400">Loading...</span>
          )}

          <span className="text-slate-400">/</span>

          {reportData ? (
            <Link
              to={`/machines/${reportData.machineId}`}
              className="text-slate-600 hover:text-slate-900"
            >
              {reportData.machineTag}
            </Link>
          ) : (
            <span className="text-slate-400">Loading...</span>
          )}

          <span className="text-slate-400">/</span>

          <span className="text-slate-900">
            {reportData?.reportLabel || "Report"}
          </span>
        </div>

        <UserBadge />
      </header>
    );
  }

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

        <UserBadge />
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

        <UserBadge />
      </header>
    );
  }

  const title = routeTitles[location.pathname] ?? "HVAC Toolbox";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <UserBadge />
    </header>
  );
}