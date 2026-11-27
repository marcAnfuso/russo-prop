import NavidadShell from "../_components/NavidadShell";
import NavidadStrip from "../_components/NavidadStrip";
import EdificioAdviento, { type PropAdviento } from "../_components/EdificioAdviento";
import RussiaFabGorro from "../_components/RussiaFabGorro";
import { getHomeFeatured } from "@/lib/homepage-lists";
import { priceLabel } from "@/lib/utils";

export const metadata = { title: "Lab · Navidad · Edificio de Adviento" };
export const dynamic = "force-dynamic";

async function propiedades(): Promise<PropAdviento[]> {
  try {
    const ps = await getHomeFeatured(15);
    return ps.map((p) => ({
      id: p.id,
      title: p.title,
      locality: p.locality,
      price: priceLabel(p),
      image: p.images[0],
      rooms: p.features.rooms,
      area: p.features.coveredArea ?? p.features.totalArea,
      operation: p.operation,
    }));
  } catch {
    return [];
  }
}

/** En diciembre usa el día real; antes, simula el 9 para que se entienda. */
function diaInicial(): number {
  const ahora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  if (ahora.getMonth() === 11 && ahora.getDate() <= 24) return ahora.getDate();
  return 9;
}

export default async function Page() {
  const props = await propiedades();
  return (
    <>
      <NavidadStrip emoji="🎁" titulo="Calendario de Adviento." frase="Cada día de diciembre, una ventana nueva en el home." />
      <NavidadShell
        name="Edificio de Adviento"
        desc="Una sección nueva en el home: un edificio con 24 ventanas, una por día de diciembre. Detrás, propiedades reales, datos y saludos."
        stripOffset
      >
        <EdificioAdviento props={props} diaInicial={diaInicial()} />
      </NavidadShell>
      <RussiaFabGorro saludo="¿ya abriste la ventana de hoy? 🎁" />
    </>
  );
}
