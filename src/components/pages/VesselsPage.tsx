import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVessels } from "../../api/vesselsApi";
import type { OfficeVessel } from "../../types/vessel";

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
              const totalMachines = vessel.machines.length;

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
                        IMO: {vessel.imoNumber}
                      </p>
                    </div>

                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {totalMachines} machine{totalMachines === 1 ? "" : "s"}
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm text-slate-600">
                    {vessel.description || "No description available."}
                  </p>
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