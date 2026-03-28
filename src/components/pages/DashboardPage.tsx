export function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Fleet overview, reports, and service insights.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Machines Online</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">--</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Machines Down</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">--</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Pending CFRs</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">--</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Maintenance Due Soon</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">--</p>
        </div>
      </div>
    </section>
  );
}