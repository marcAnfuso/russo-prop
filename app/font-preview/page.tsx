import "./fonts.css";

const FONTS = [
  { name: "Playfair Display", className: "font-playfair", desc: "Clásica elegante, muy usada en luxury" },
  { name: "DM Serif Display", className: "font-dm-serif", desc: "Moderna y limpia, menos recargada" },
  { name: "Cormorant Garamond", className: "font-cormorant", desc: "Ultra elegante, estilo Miranda Bosch" },
  { name: "Libre Baskerville", className: "font-baskerville", desc: "Seria, profesional, muy legible" },
];

export default function FontPreview() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-20">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-widest text-magenta font-semibold">Font Preview</p>
          <h1 className="text-3xl font-bold text-navy" style={{ fontFamily: "Inter" }}>
            Comparativa de tipografias para Russo Propiedades
          </h1>
          <p className="text-gray-400">Cada bloque simula cómo se vería la home con esa fuente en títulos</p>
        </div>

        {FONTS.map((font) => (
          <section
            key={font.name}
            className="rounded-2xl border border-gray-100 overflow-hidden shadow-lg"
          >
            {/* Header */}
            <div className="bg-navy px-8 py-4 flex items-center justify-between">
              <span className="text-white font-semibold">{font.name}</span>
              <span className="text-white/50 text-sm">{font.desc}</span>
            </div>

            {/* Hero simulation */}
            <div className="bg-gradient-to-br from-navy to-navy/80 px-8 py-16 text-center">
              <p className="text-xs uppercase tracking-widest text-magenta mb-4">Russo Propiedades</p>
              <h2 className={`${font.className} text-5xl text-white mb-4`}>
                Tu próximo hogar empieza acá
              </h2>
              <p className="text-white/60 text-lg max-w-lg mx-auto" style={{ fontFamily: "Inter" }}>
                Las necesidades y objetivos de nuestros clientes son nuestra prioridad
              </p>
            </div>

            {/* Sections simulation */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-100">
              {/* Light section */}
              <div className="px-8 py-10 bg-white">
                <p className="text-xs uppercase tracking-widest text-magenta mb-2">Selección de propiedades</p>
                <h3 className={`${font.className} text-3xl text-navy mb-3`}>
                  Propiedades <span className="text-magenta">destacadas</span>
                </h3>
                <p className="text-gray-400 text-sm" style={{ fontFamily: "Inter" }}>
                  Lo que estás buscando, lo podés encontrar
                </p>
              </div>

              {/* Dark section */}
              <div className="px-8 py-10 bg-navy">
                <p className="text-xs uppercase tracking-widest text-magenta mb-2">Nuestros valores</p>
                <h3 className={`${font.className} text-3xl text-white mb-3`}>
                  ¿Por qué elegirnos?
                </h3>
                <p className="text-white/50 text-sm" style={{ fontFamily: "Inter" }}>
                  Más de 30 años en el mercado inmobiliario
                </p>
              </div>
            </div>

            {/* Card simulation */}
            <div className="px-8 py-8 bg-gray-50 border-t border-gray-100">
              <div className="flex items-baseline gap-4">
                <span className={`${font.className} text-2xl text-navy`}>USD 85.000</span>
                <span className="text-gray-400 text-sm" style={{ fontFamily: "Inter" }}>Departamento en Venta</span>
              </div>
              <p className="mt-1 text-sm text-gray-500" style={{ fontFamily: "Inter" }}>
                Jujuy 2449, San Justo, La Matanza
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
