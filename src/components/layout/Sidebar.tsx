import { useState } from "react";
import {
  FaChartLine,
  FaCubes,
  FaFileAlt,
  FaMagic,
  FaShip,
  FaTachometerAlt,
  FaTasks,
  FaTools,
} from "react-icons/fa";
import { FiSidebar } from "react-icons/fi";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: FaTachometerAlt },
  { to: "/reports", label: "Reports", icon: FaFileAlt },
  { to: "/vessels", label: "Vessels", icon: FaShip },
  { to: "/machines", label: "Machines", icon: FaTools },
  { to: "/parts", label: "Parts", icon: FaCubes },
  { to: "/ai-generation", label: "AI Generation", icon: FaMagic },
  { to: "/task-plans", label: "Task Plans", icon: FaTasks },
  { to: "/insights", label: "Insights", icon: FaChartLine },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="px-4 py-5">
        <div
          className={`flex items-center gap-3 transition-all duration-300 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div
            className={`flex min-w-0 items-center gap-3 overflow-hidden transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-40 opacity-100"
            }`}
          >
            <img
              src="/favicon.png"
              alt="Logo"
              className="h-11 w-11 shrink-0"
            />

            <div className="min-w-0 overflow-hidden whitespace-nowrap">
              <h1 className="text-sm font-semibold text-slate-900">
                HVAC Toolbox
              </h1>
              <p className="mt-1 text-xs text-slate-500">Fleet management</p>
            </div>
          </div>

          <button
            type="button"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((current) => !current)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <FiSidebar
              className={`h-5 w-5 transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              className={({ isActive }) =>
                `flex items-center rounded-2xl py-3 text-sm font-medium transition-all duration-300 ${
                  collapsed ? "justify-center px-0" : "gap-3 px-4"
                } ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  collapsed
                    ? "max-w-0 translate-x-2 opacity-0"
                    : "max-w-40 translate-x-0 opacity-100"
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
