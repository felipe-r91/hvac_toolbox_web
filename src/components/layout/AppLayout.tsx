import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="min-h-0 flex-1 overflow-hidden p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
