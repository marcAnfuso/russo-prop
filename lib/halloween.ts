/**
 * Flag temporal de Halloween 2026 (el 31 cae sábado).
 *
 * Las decoraciones (cintillo con frase, telaraña y murciélagos en el hero,
 * calabaza en el subrayado de "empieza acá" y Russia vestida de calabaza)
 * se prenden solas el viernes 30 y se apagan solas al terminar el domingo 1.
 * No hay que sacarlas a mano.
 *
 * Para verlo antes de la fecha (en local o en producción) agregá
 * `?halloween=1` a cualquier URL: queda prendido en esa pestaña mientras se
 * navega. `?halloween=0` lo vuelve a apagar.
 */
const START = new Date("2026-10-30T00:00:00-03:00").getTime();
const END = new Date("2026-11-01T23:59:59-03:00").getTime();

/** Frase del cintillo. Cambiarla acá es lo único que hace falta. */
export const HALLOWEEN_FRASE = "Casas embrujadas no tenemos. Encantadoras, todas.";

export function isHalloweenActive(now: number = Date.now()): boolean {
  return now >= START && now <= END;
}
