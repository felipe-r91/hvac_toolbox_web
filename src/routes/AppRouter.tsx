import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardPage } from "./../components/pages/DashboardPage";
import { ReportsPage } from "./../components/pages/ReportsPage";
import { MachinesPage } from "./../components/pages/MachinesPage";
import { VesselsPage } from "../components/pages/VesselsPage";
import { CFRCenterPage } from "../components/pages/CFRCenterPage";
import { InsightsPage } from "../components/pages/InsightsPage";
import { MachineDetailPage } from "../components/pages/MachineDetailPage";
import { VesselDetailPage } from "../components/pages/VesselDetailPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          <Route path="/vessels" element={<VesselsPage />} />
          <Route path="/cfr-center" element={<CFRCenterPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/machines/:machineId" element={<MachineDetailPage />} />
          <Route path="/vessels/:vesselId" element={<VesselDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}