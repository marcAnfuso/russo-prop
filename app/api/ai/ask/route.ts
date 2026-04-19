import { NextRequest, NextResponse } from "next/server";
import { fetchProperty } from "@/lib/xintel";
import { gemini, FLASH_MODEL } from "@/lib/gemini";

export const maxDuration = 30;

const SYSTEM = `Sos el asistente de Russo Propiedades. El usuario está viendo UNA propiedad específica y te hace una pregunta sobre ella.

Tu trabajo es que el usuario no tenga que leer el mazacote de texto de la descripción. Extraé lo que le sirve.

Reglas estrictas:
- Respondé SOLO basándote en la data que te paso. NO inventes nada.
- PROHIBIDO rellenar con frases genéricas vacías del tipo "zona con excelentes servicios", "accesos cercanos", "ubicación ideal", "gran oportunidad", "excelente estado". Esas frases NO agregan información: si no podés decir algo concreto y específico (una calle concreta, un comercio concreto, un detalle concreto de la descripción), es mejor admitir que no tenés el dato.
- NO repitas lo que ya se ve en la ficha: precio, m², ambientes, baños, dormitorios, cocheras. Si el usuario pregunta uno de esos, respondelo brevemente pero agregá valor ("Son 120m² cubiertos; según la descripción, el frente tiene persiana metálica").
- Priorizá extraer DATOS ESPECÍFICOS de la DESCRIPCIÓN: nombres propios (calles, comercios, transporte), servicios concretos (gas natural, agua caliente, calefacción), detalles de ambientes ("cocina separada", "patio con parrilla"), reglas del edificio, estado real.
- TENÉS GOOGLE SEARCH como herramienta. Si el usuario pregunta sobre la zona, qué hay cerca, transporte, colegios, comercios, seguridad del barrio o características que NO están en la descripción pero SÍ son verificables con información pública sobre la DIRECCIÓN EXACTA, hacé una búsqueda web usando la dirección de la propiedad y respondé con info concreta (nombres de calles, instituciones, medios de transporte, distancias aproximadas). No inventes resultados — si la búsqueda no devuelve info clara, admitilo.
- Si la descripción no tiene info específica y la búsqueda web tampoco devuelve nada útil, respondé literalmente: "No tengo ese detalle cargado en la ficha. Te lo pueden ampliar por WhatsApp en un segundo." Mejor eso que inventar.
- Respuestas cortas (1-3 oraciones), castellano rioplatense (voseo OK), sin tildes raras.
- NUNCA des información sobre otras propiedades, mercado, trámites legales o temas financieros.
- Si la pregunta no tiene que ver con la propiedad, redireccioná amablemente.`;

function propertyContext(p: NonNullable<Awaited<ReturnType<typeof fetchProperty>>>): string {
  const feat = p.features;
  return `DATA DE LA PROPIEDAD:
- Código: ${p.code}
- Tipo: ${p.type}${p.subtype ? ` (${p.subtype})` : ""}
- Operación: ${p.operation}
- Precio: ${p.currency} ${p.price}
- Dirección: ${p.address}
- Barrio: ${p.locality}${p.district ? `, ${p.district}` : ""}
- Ambientes: ${feat.rooms ?? "s/d"}
- Dormitorios: ${feat.bedrooms ?? "s/d"}
- Baños: ${feat.bathrooms ?? "s/d"}
- Cocheras: ${feat.garage ?? "s/d"}
- Superficie cubierta: ${feat.coveredArea ?? "s/d"} m²
- Superficie total: ${feat.totalArea ?? "s/d"} m²
- Antigüedad: ${feat.age != null ? `${feat.age} años` : "s/d"}
- Amenities: ${p.amenities.length ? p.amenities.join(", ") : "(no cargadas)"}
- Expensas: ${p.details?.expenses ? `$ ${p.details.expenses} ARS/mes` : "no cargadas"}
- Piso: ${p.details?.floor ?? "s/d"}
- Estado: ${p.details?.condition ?? "s/d"}
- Orientación: ${p.details?.orientation ?? "s/d"}

DESCRIPCIÓN ORIGINAL:
${p.description || "(sin descripción)"}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const propertyId = typeof body.propertyId === "string" ? body.propertyId : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!propertyId || !question) {
    return NextResponse.json(
      { ok: false, error: "missing propertyId or question" },
      { status: 400 }
    );
  }
  if (question.length > 400) {
    return NextResponse.json(
      { ok: false, error: "pregunta demasiado larga" },
      { status: 400 }
    );
  }

  try {
    const property = await fetchProperty(propertyId);
    if (!property) {
      return NextResponse.json(
        { ok: false, error: "propiedad no encontrada" },
        { status: 404 }
      );
    }
    const res = await gemini().models.generateContent({
      model: FLASH_MODEL,
      contents: `${SYSTEM}\n\n${propertyContext(property)}\n\nPREGUNTA DEL USUARIO: ${question}\n\nTU RESPUESTA:`,
      config: {
        temperature: 0.2,
        maxOutputTokens: 2000,
        // Google Search grounding — si la pregunta no se puede responder
        // con la data de la ficha, Gemini puede buscar en la web usando
        // la dirección de la propiedad. Útil para "qué hay cerca",
        // "cómo está el barrio", transporte público, colegios, etc.
        tools: [{ googleSearch: {} }],
      },
    });
    const answer = (res.text ?? "").trim();
    if (!answer) {
      return NextResponse.json({
        ok: true,
        answer:
          "No tengo ese dato cargado. Te recomiendo consultarlo directamente con un agente de Russo.",
      });
    }
    return NextResponse.json({ ok: true, answer });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
