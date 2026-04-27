import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardPage } from "./../components/pages/DashboardPage";
import { ReportsPage } from "./../components/pages/ReportsPage";
import { MachinesPage } from "./../components/pages/MachinesPage";
import { VesselsPage } from "../components/pages/VesselsPage";
import { AiGenerationPage } from "../components/pages/CFRCenterPage";
import { InsightsPage } from "../components/pages/InsightsPage";
import { MachineDetailPage } from "../components/pages/MachineDetailPage";
import { VesselDetailPage } from "../components/pages/VesselDetailPage";
import { CfrReportDetailPage } from "../components/pages/CfrReportDetailPage";
import { CorrectiveReportDetailPage } from "../components/pages/CorrectiveReportDetailPage";
import { HealthCheckReportDetailPage } from "../components/pages/HealthCheckReportDetailPage";

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
          <Route path="/ai-generation" element={<AiGenerationPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/machines/:machineId" element={<MachineDetailPage />} />
          <Route path="/vessels/:vesselId" element={<VesselDetailPage />} />
          <Route path="/reports/:reportId" element={<HealthCheckReportDetailPage />} />
          <Route path="/corrective-reports/:reportId" element={<CorrectiveReportDetailPage />} />
          <Route path="/cfr-reports/:reportId" element={<CfrReportDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}