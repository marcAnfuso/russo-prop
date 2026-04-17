/**
 * Skeleton for /ventas and /alquileres while PropertyListWithMap hydrates.
 * Mirrors the filter bar + two-column (list + map) layout so there's no
 * jarring layout shift when the real content lands.
 */
export default function PropertyListSkeleton({
  operation = "venta",
}: {
  operation?: "venta" | "alquiler";
}) {
  const label = operation === "venta" ? "Propiedades en venta" : "Propiedades en alquiler";
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="h-3 w-20 bg-gray-100 rounded-full" />
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        <p className="sr-only">{label} — cargando</p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 rounded-xl bg-white border border-gray-100 p-4 flex flex-wrap gap-3">
        {[180, 140, 120, 120, 100, 100].map((w, i) => (
          <div
            key={i}
            className="h-10 rounded-lg bg-gray-100"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Two-column: list + map */}
      <div className="grid lg:grid-cols-[1fr_45%] gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-gray-100 overflow-hidden"
            >
              <div className="aspect-[4/3] bg-gray-100" />
              <div className="p-5 space-y-3">
                <div className="h-6 w-2/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                <div className="flex gap-3 pt-2">
                  <div className="h-3 w-12 bg-gray-100 rounded" />
                  <div className="h-3 w-12 bg-gray-100 rounded" />
                  <div className="h-3 w-12 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24 h-[600px] rounded-2xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
