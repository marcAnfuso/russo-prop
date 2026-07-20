/**
 * Cintillo slim arriba de todo (dentro del navbar fijo).
 * Mensaje de agradecimiento a la Selección tras la final del Mundial 2026.
 */
export default function CountdownStrip() {
  return (
    <div className="w-full bg-navy text-white">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap px-3 text-[12px] font-medium sm:gap-2.5 sm:px-4 sm:text-[12.5px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://flagcdn.com/w40/ar.png" alt="Argentina" className="h-3.5 rounded-[2px] ring-1 ring-white/20" />
        <span className="font-semibold">Gracias, Selección.</span>
        <span className="text-[#8fc0ec]">Lo dejaron todo.</span>
      </div>
    </div>
  );
}
