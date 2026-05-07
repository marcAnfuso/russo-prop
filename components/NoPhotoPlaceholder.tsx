import { Camera } from "lucide-react";

interface NoPhotoPlaceholderProps {
  /** Tamaño del texto · "sm" para cards, "lg" para galería de detalle */
  size?: "sm" | "lg";
  /** Mensaje secundario opcional. Default: "Estamos sacando las fotos". */
  subtitle?: string;
}

/**
 * Placeholder visual cuando una propiedad no tiene fotos cargadas en
 * Xintel. Diseñado para verse profesional · gradient magenta/navy con
 * patrón sutil + ícono y mensaje "Próximamente" claro. Evita que el
 * usuario piense que el sitio está roto.
 */
export default function NoPhotoPlaceholder({
  size = "sm",
  subtitle = "Estamos sacando las fotos",
}: NoPhotoPlaceholderProps) {
  const titleClass =
    size === "lg" ? "text-3xl sm:text-4xl" : "text-base sm:text-lg";
  const subClass = size === "lg" ? "text-sm sm:text-base" : "text-[10px] sm:text-xs";
  const iconClass = size === "lg" ? "h-10 w-10 sm:h-12 sm:w-12" : "h-5 w-5 sm:h-6 sm:w-6";
  const iconWrap =
    size === "lg" ? "h-16 w-16 sm:h-20 sm:w-20" : "h-9 w-9 sm:h-11 sm:w-11";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient navy → magenta · colores institucionales */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-magenta" />

      {/* Patrón sutil de puntos para que no quede un block plano */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Glow magenta arriba derecha */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-magenta/30 blur-3xl" />

      {/* Contenido centrado */}
      <div className="relative h-full w-full flex flex-col items-center justify-center text-white text-center px-3">
        <div
          className={`${iconWrap} flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/20 mb-2 sm:mb-3`}
        >
          <Camera className={`${iconClass} text-white/90`} aria-hidden="true" />
        </div>
        <p className={`${titleClass} font-display font-semibold tracking-tight leading-tight`}>
          Próximamente
        </p>
        <p className={`${subClass} text-white/70 mt-1 leading-snug`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
