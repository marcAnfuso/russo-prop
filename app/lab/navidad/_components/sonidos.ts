"use client";

/**
 * Sonidos sintetizados con WebAudio (sin archivos): una campanita y unos
 * cascabeles. Sólo suenan tras un click/tap del usuario (política de
 * autoplay de los navegadores), así que nunca hay ruido sorpresa al entrar.
 */
let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Campanita: parciales inarmónicos con caída exponencial. `nota` en Hz. */
export function campanita(nota = 1318.5, vol = 0.18) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const salida = a.createGain();
  salida.gain.value = vol;
  salida.connect(a.destination);
  [1, 2.76, 5.4, 8.93].forEach((r, i) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "sine";
    o.frequency.value = nota * r;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1 / (i + 1), t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4 / (i + 1));
    o.connect(g).connect(salida);
    o.start(t);
    o.stop(t + 1.5);
  });
}

/** Cascabeles: ráfagas cortas de ruido filtrado agudo. */
export function cascabeles(golpes = 6, vol = 0.12) {
  const a = audio();
  if (!a) return;
  const largo = Math.floor(a.sampleRate * 0.08);
  const buf = a.createBuffer(1, largo, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < largo; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / largo, 3);
  for (let k = 0; k < golpes; k++) {
    const t = a.currentTime + k * 0.085 + Math.random() * 0.02;
    const s = a.createBufferSource();
    s.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 6500 + Math.random() * 2500;
    f.Q.value = 3;
    const g = a.createGain();
    g.gain.value = vol * (1 - k / (golpes * 1.4));
    s.connect(f).connect(g).connect(a.destination);
    s.start(t);
  }
}

/** Melodía de campanitas (primeras notas de "Jingle Bells", dominio público). */
export function melodia() {
  const E = 1318.5, G = 1568, C = 1046.5, D = 1174.7;
  const notas: [number, number][] = [[E, 0], [E, 0.18], [E, 0.36], [E, 0.72], [E, 0.9], [E, 1.08], [E, 1.44], [G, 1.62], [C, 1.8], [D, 1.98], [E, 2.16]];
  notas.forEach(([n, t]) => setTimeout(() => campanita(n, 0.12), t * 1000));
  setTimeout(() => cascabeles(8, 0.08), 2300);
}

/** "¡Jo, jo, jo!" con la voz del sistema (grave y lenta), si hay. */
export function joJoJo(texto = "¡Jo, jo, jo!") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(texto);
    const voces = window.speechSynthesis.getVoices();
    u.voice = voces.find((v) => v.lang === "es-AR") ?? voces.find((v) => v.lang.startsWith("es")) ?? null;
    u.lang = u.voice?.lang ?? "es-AR";
    u.pitch = 0.55;
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* sin voz: no pasa nada */
  }
}
