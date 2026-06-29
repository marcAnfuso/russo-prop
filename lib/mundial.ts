/**
 * Flag temporal del Mundial 2026.
 *
 * Las decoraciones (línea patria + sol en el hero, 3 estrellas con años bajo
 * el logo, confetti al cargar, sticker de esquina y la vincha de Russia) se
 * prenden solas dentro de esta ventana y se apagan solas al terminar. No hay
 * que sacarlas a mano: pasada la fecha de fin, todo vuelve a la normalidad.
 *
 * Para apagarlo antes de tiempo: poné END en una fecha pasada (o ajustá la
 * ventana). Para extenderlo: corré END más adelante.
 */
const START = new Date("2026-06-10T00:00:00-03:00").getTime();
const END = new Date("2026-07-20T23:59:59-03:00").getTime(); // día después de la final

/** Años de los 3 títulos mundiales de Argentina. */
export const MUNDIAL_YEARS = ["1978", "1986", "2022"] as const;

export function isMundialActive(now: number = Date.now()): boolean {
  return now >= START && now <= END;
}
