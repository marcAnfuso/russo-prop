import Image from "next/image";
import MatchCountdownBar from "../_components/MatchCountdownBar";

export const metadata = { title: "Lab · Mundial · Countdown slim" };

export default function Page() {
  return (
    // pt-9 extra: el navbar con estrellas mide ~102px y el layout reserva 72;
    // acá empujamos para que la barra no quede tapada (solo para el preview).
    <div className="pt-9">
      {/* Cintillo slim arriba del hero */}
      <MatchCountdownBar />

      {/* Maqueta del hero (sin el -mt-72 del real, para que la barra se vea) */}
      <section className="relative flex min-h-[68vh] items-center justify-center overflow-hidden">
        <Image src="/images/hero-russo-color.webp" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 px-4 text-center text-white">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            Zona Oeste · desde 1992
          </p>
          <h1
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ textShadow: "0 2px 30px rgba(0,0,0,0.35)" }}
          >
            Tu próximo hogar
            <br />
            empieza acá
          </h1>
        </div>
      </section>
    </div>
  );
}
