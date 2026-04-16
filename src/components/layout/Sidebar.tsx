import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/reports", label: "Reports" },
  { to: "/machines", label: "Machines" },
  { to: "/vessels", label: "Vessels" },
  { to: "/cfr-center", label: "CFR Center" },
  { to: "/insights", label: "Insights" },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="px-6 py-5">
        <img src="/favicon.png" alt="Logo" width="60" height="60"/>
        <h1 className="text-xl font-semibold text-slate-900">HVAC Toolbox</h1>
        <p className="mt-1 text-sm text-slate-500">Fleet management</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}