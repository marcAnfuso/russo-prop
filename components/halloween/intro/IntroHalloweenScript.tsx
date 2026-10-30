import { INTRO_END, INTRO_KEY, INTRO_START } from "@/lib/halloween";

/**
 * Decide antes del primer pintado si este visitante ve la intro, así la web
 * no se asoma ni un instante. Tiene que ir primero en el <body>.
 *
 * - `hw-cover`: tapa la web hasta que la escena esté lista. Si en 4 s no llegó
 *   (conexión lenta), se saca solo y esa visita entra directo, sin intro.
 * - `hw-intro`: dura toda la intro; frena la araña y los murciélagos del Hero
 *   para que arranquen recién cuando se ve la web.
 *
 * `?intro=1` en el home la fuerza, para volver a verla.
 */
const CSS = `
html.hw-cover body{overflow:hidden}
html.hw-cover body::after{content:"";position:fixed;inset:0;z-index:199;background:#0a0d2c}
html.hw-intro .hw-bat,html.hw-intro .hw-hilo,html.hw-intro .hw-hilo-pivote{animation-play-state:paused}
`;

const JS = `(function(){try{
var d=document.documentElement,n=Date.now();
if(location.pathname!=="/")return;
if(!/[?&]intro=1(&|$)/.test(location.search)&&(n<${INTRO_START}||n>${INTRO_END}||localStorage.getItem("${INTRO_KEY}")||/bot|crawl|spider|lighthouse/i.test(navigator.userAgent)))return;
d.classList.add("hw-intro","hw-cover");
setTimeout(function(){if(d.classList.contains("hw-cover"))d.classList.remove("hw-intro","hw-cover")},4000);
}catch(e){}})()`;

export default function IntroHalloweenScript() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script dangerouslySetInnerHTML={{ __html: JS }} />
    </>
  );
}
