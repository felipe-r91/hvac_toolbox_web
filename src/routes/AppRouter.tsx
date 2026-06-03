import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardPage } from "./../components/pages/DashboardPage";
import { ReportsPage } from "./../components/pages/ReportsPage";
import { MachinesPage } from "./../components/pages/MachinesPage";
import { VesselsPage } from "../components/pages/VesselsPage";
import { AiGenerationService } from "../components/pages/AiGenerationService";
import { InsightsPage } from "../components/pages/InsightsPage";
import { MachineDetailPage } from "../components/pages/MachineDetailPage";
import { VesselDetailPage } from "../components/pages/VesselDetailPage";
import { CfrReportDetailPage } from "../components/pages/CfrReportDetailPage";
import { ServiceReportDetailPage } from "../components/pages/ServiceReportDetailPage";
import {
  HealthCheckReportDetailPage,
  MachineMaintenanceReportDetailPage,
} from "../components/pages/MachineMaintenanceReportDetailPage";
import { AiGenerationPage } from "../components/pages/AiGenerationPage";
import { DailyReportDetailPage } from "../components/pages/DailyReportDetailPage";
import { TaskPlansPage } from "../components/pages/TaskPlansPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          <Route path="/task-plans" element={<TaskPlansPage />} />
          <Route path="/vessels" element={<VesselsPage />} />
          <Route path="/ai-generation-service/:reportType/:reportId" element={<AiGenerationService />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/machines/:machineId" element={<MachineDetailPage />} />
          <Route path="/vessels/:vesselId" element={<VesselDetailPage />} />
          <Route path="/machine-maintenance-reports/:reportId" element={<MachineMaintenanceReportDetailPage />} />
          <Route path="/health-check-reports/:reportId" element={<HealthCheckReportDetailPage />} />
          <Route path="/service-report/:reportId" element={<ServiceReportDetailPage />} />
          <Route path="/cfr-reports/:reportId" element={<CfrReportDetailPage />} />
          <Route path="/daily-reports/:reportId" element={<DailyReportDetailPage />} />
          <Route path="/ai-generation" element={<AiGenerationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
