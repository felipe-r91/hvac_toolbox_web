import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVessels } from "../../api/vesselsApi";
import type { OfficeVessel } from "../../types/vessel";

function DetailField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}

export function VesselsPage() {
  const [vessels, setVessels] = useState<OfficeVessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getVessels();
        setVessels(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load vessels.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Loading vessels...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="flex h-[calc(100vh-8.5rem)] min-h-0 flex-col">
      <section className="min-h-0 flex-1 overflow-auto">
        {vessels.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 p-4">
            {vessels.map((vessel) => {
              const totalMachines = vessel.machines?.length ?? 0;

              return (
                <Link
                  key={vessel.id}
                  to={`/vessels/${vessel.id}`}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {vessel.name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {vessel.vesselType || "Unknown vessel type"}
                      </p>
                    </div>

                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {totalMachines} machine{totalMachines === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailField label="IMO Number" value={vessel.imoNumber} />
                    <DetailField label="Vessel IMO" value={vessel.vesselImo} />
                    <DetailField label="Vessel Type" value={vessel.vesselType} />
                    <DetailField
                      label="Owner / Customer"
                      value={vessel.ownerCustomer}
                    />
                    <DetailField
                      label="Vessel Contact"
                      value={vessel.vesselContact}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">No vessels found.</p>
          </section>
        )}
      </section>
    </section>
  );
}
