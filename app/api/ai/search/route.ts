import { NextRequest, NextResponse } from "next/server";
import { Type, type FunctionDeclaration } from "@google/genai";
import { gemini, FLASH_MODEL } from "@/lib/gemini";
import {
  searchProperties,
  searchPropertiesNear,
  type SearchFilters,
  type NearSearchInput,
} from "@/lib/property-search";
import type { Property } from "@/data/types";
import { listPOILabels } from "@/lib/pois";

export const maxDuration = 30;

const POI_LIST = listPOILabels().join(", ");

const SYSTEM = `Sos Russia, la asistente de IA de Russo Propiedades, una inmobiliaria de zona oeste (Buenos Aires, Argentina) con más de 30 años de experiencia.

Tu trabajo es ayudar al usuario a encontrar la propiedad ideal en el catálogo de Russo. Tenés DOS herramientas:

1. **search_properties**: búsqueda general por filtros (operación, zona, precio, ambientes, etc).
2. **search_properties_near**: búsqueda geo-espacial. **Usá esta cuando el usuario mencione un punto de referencia** ("cerca de la estación de Ramos", "a X cuadras del hospital Paroissien", "cerca de UNLaM", "próximo a Av. Perón 3500"). Combina el punto con todos los demás filtros normales.

PUNTOS DE INTERÉS conocidos (zona oeste · siempre disponibles para search_properties_near sin costo extra): ${POI_LIST}.

Si el punto NO está en esa lista (ej. "cerca del Starbucks de Ramos", "a 3 cuadras de tal calle específica"), igual usá search_properties_near · el sistema hace fallback a geocodificación.

REGLAS DE EXTRACCIÓN DE FILTROS:
- "Comprar" / "venta" / "compra" → operation: "venta"
- "Alquilar" / "alquiler" / "renta" → operation: "alquiler"
- "Casa" → types: ["casa"], "Departamento" / "depto" → ["departamento"], "PH" → ["ph"], "Terreno" / "lote" → ["terreno"], "Local" → ["local"], "Galpón" → ["galpon"]
- "2 ambientes" → roomsMin: 2 (asumimos exacto, pero buscamos >=)
- "2 dormitorios" → bedroomsMin: 2
- "hasta 100 mil USD" / "menos de 100k" → priceMax: 100000, priceCurrency: "USD"
- "hasta 500 mil pesos" / "$500.000" → priceMax: 500000, priceCurrency: "ARS"
- "con cochera" / "garage" → hasGarage: true
- "con piscina" / "con pileta" → amenities: ["piscina"]
- "con balcón" → amenities: ["balcón"]
- "con video" / "video tour" → hasVideo: true
- Si dicen una calle ("Salta", "Perón 3500") → text: "<calle>"
- Códigos RUS ("RUS10989") → text: "<código>"

ZONAS COMUNES (matchear flexible):
San Justo, Ramos Mejía, Villa Luzuriaga, Haedo, Morón, Ciudadela, Caseros, La Tablada, Isidro Casanova, González Catán, Tapiales, Rafael Castillo, Lomas del Mirador, Aldo Bonzi, La Matanza.

REGLAS DE RESPUESTA:
- Castellano rioplatense, voseo OK, sin emojis excesivos.
- Respuestas cortas (1-3 oraciones de texto · las propiedades se muestran como cards aparte).
- Después de una búsqueda con resultados, presentá el contexto: "Encontré X propiedades en zona Y..." y sugerí refinar (ej. "¿Querés que filtre por cochera o algo específico?").
- Si la búsqueda no devuelve nada, decílo honestamente y sugerí flexibilizar (ampliar zonas, subir presupuesto, sacar un filtro). NO inventes propiedades.
- Si los criterios son muy ambiguos ("algo lindo"), pedí 1 dato concreto (zona o presupuesto) antes de buscar.

CONTACTOS DE RUSSO (si los preguntan):
- WhatsApp: +54 11 5018 7340 · https://wa.me/5491150187340
- Email: info@russopropiedades.com.ar
- Sede San Justo: Av. Pte J. D. Perón 3501 (sede histórica desde 1992 · atención por WhatsApp / mail / cita previa)
- Sede Ramos Mejía: Belgrano 123 (próxima apertura · atención al público sin cita)

Si el usuario te pregunta algo no inmobiliario, redireccioná amablemente.`;

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface RequestBody {
  message: string;
  history?: ChatMessage[];
}

interface PropertyCard {
  id: string;
  code: string;
  title: string;
  operation: string;
  type: string;
  price: number;
  currency: string;
  address: string;
  locality: string;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garage: number | null;
  totalArea: number | null;
  image: string | null;
}

function toCard(p: Property): PropertyCard {
  return {
    id: p.id,
    code: p.code,
    title: p.title,
    operation: p.operation,
    type: p.type,
    price: p.price,
    currency: p.currency,
    address: p.address,
    locality: p.locality,
    rooms: p.features.rooms ?? null,
    bedrooms: p.features.bedrooms ?? null,
    bathrooms: p.features.bathrooms ?? null,
    garage: p.features.garage ?? null,
    totalArea: p.features.totalArea ?? null,
    image: p.images[0] ?? null,
  };
}

const SEARCH_TOOL: { functionDeclarations: FunctionDeclaration[] } = {
  functionDeclarations: [
    {
      name: "search_properties_near",
      description:
        "Busca propiedades CERCA de un punto de referencia (estación, plaza, hospital, dirección concreta, calle específica). Usalo cuando el usuario mencione 'cerca de X', 'a Y cuadras de Z', 'próximo a', etc. Combinable con todos los filtros normales (precio, ambientes, tipo).",
      parameters: {
        type: Type.OBJECT,
        properties: {
          referencePoint: {
            type: Type.STRING,
            description:
              "Punto de referencia textual ('estación de Ramos Mejía', 'plaza San Justo', 'UNLaM', 'Av. Perón 3500', etc).",
          },
          radiusMeters: {
            type: Type.NUMBER,
            description:
              "Radio de búsqueda en metros. Default 1500 (~12 cuadras). 1 cuadra ≈ 100m. Para 'a 5 cuadras' usar 500.",
          },
          operation: { type: Type.STRING, enum: ["venta", "alquiler"] },
          types: { type: Type.ARRAY, items: { type: Type.STRING } },
          priceMax: { type: Type.NUMBER },
          priceMin: { type: Type.NUMBER },
          priceCurrency: { type: Type.STRING, enum: ["USD", "ARS"] },
          roomsMin: { type: Type.NUMBER },
          bedroomsMin: { type: Type.NUMBER },
          bathroomsMin: { type: Type.NUMBER },
          hasGarage: { type: Type.BOOLEAN },
          hasVideo: { type: Type.BOOLEAN },
          amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["referencePoint"],
      },
    },
    {
      name: "search_properties",
      description:
        "Busca propiedades en el catálogo de Russo Propiedades según filtros estructurados. Devuelve hasta 5 propiedades que matchean todos los criterios.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          operation: {
            type: Type.STRING,
            enum: ["venta", "alquiler"],
            description: "Tipo de operación que busca el usuario.",
          },
          zones: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Localidades o barrios deseados (San Justo, Ramos Mejía, etc).",
          },
          types: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              'Tipos de propiedad. Valores válidos: "casa", "departamento", "ph", "terreno", "cochera", "local", "oficina", "edificio", "galpon", "negocio", "quinta", "campo".',
          },
          priceMax: { type: Type.NUMBER, description: "Tope de precio." },
          priceMin: { type: Type.NUMBER, description: "Precio mínimo." },
          priceCurrency: {
            type: Type.STRING,
            enum: ["USD", "ARS"],
            description: "Moneda del precio. USD para venta, ARS para alquiler en general.",
          },
          roomsMin: { type: Type.NUMBER, description: "Ambientes mínimos." },
          bedroomsMin: { type: Type.NUMBER, description: "Dormitorios mínimos." },
          bathroomsMin: { type: Type.NUMBER, description: "Baños mínimos." },
          hasGarage: {
            type: Type.BOOLEAN,
            description: "Si quiere cochera/garage.",
          },
          hasVideo: {
            type: Type.BOOLEAN,
            description: "Si quiere propiedades con video tour.",
          },
          amenities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Amenities deseados (ej: "piscina", "balcón", "parrilla", "sum").',
          },
          text: {
            type: Type.STRING,
            description:
              "Texto libre para matchear contra dirección/calle/código RUS si el usuario menciona una calle o código.",
          },
        },
      },
    },
  ],
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as RequestBody;
  const userMessage = (body.message || "").trim();
  const history = body.history ?? [];

  if (!userMessage) {
    return NextResponse.json(
      { ok: false, error: "missing message" },
      { status: 400 }
    );
  }
  if (userMessage.length > 500) {
    return NextResponse.json(
      { ok: false, error: "mensaje demasiado largo" },
      { status: 400 }
    );
  }

  try {
    const client = gemini();

    // Construir el contenido completo: history + nuevo mensaje
    const contents = [
      ...history.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    // Primer call · Gemini decide si llamar la función o responder directo
    const firstRes = await client.models.generateContent({
      model: FLASH_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM,
        temperature: 0.3,
        maxOutputTokens: 1500,
        tools: [SEARCH_TOOL],
      },
    });

    const candidate = firstRes.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    const fnCall = parts.find((p) => p.functionCall)?.functionCall;

    // Si Gemini decidió responder sin búsqueda
    if (!fnCall) {
      const answer = (firstRes.text ?? "").trim();
      return NextResponse.json({
        ok: true,
        answer: answer || "¿Podés contarme un poco más sobre lo que buscás?",
        properties: [],
      });
    }

    // Ejecutar la búsqueda · routing por nombre de la función
    const args = (fnCall.args ?? {}) as Record<string, unknown>;
    const result =
      fnCall.name === "search_properties_near"
        ? await searchPropertiesNear(args as unknown as NearSearchInput, 5)
        : await searchProperties(args as SearchFilters, 5);
    const filters = args;

    // Segundo call · le pasamos los resultados a Gemini para que
    // componga la respuesta final natural
    const followUp = await client.models.generateContent({
      model: FLASH_MODEL,
      contents: [
        ...contents,
        {
          role: "model",
          parts: [{ functionCall: fnCall }],
        },
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: fnCall.name ?? "search_properties",
                response: {
                  total: result.total,
                  shown: result.matches.length,
                  hint: result.hint,
                  reference_point: result.referencePoint
                    ? {
                        label: result.referencePoint.label,
                        source: result.referencePoint.source,
                      }
                    : undefined,
                  matches: result.matches.map((p) => ({
                    code: p.code,
                    type: p.type,
                    operation: p.operation,
                    price: p.price,
                    currency: p.currency,
                    address: p.address,
                    locality: p.locality,
                    rooms: p.features.rooms,
                    bedrooms: p.features.bedrooms,
                    bathrooms: p.features.bathrooms,
                    garage: p.features.garage,
                    distance_meters: result.distancesById?.[p.id] ?? null,
                  })),
                  filters_applied: filters,
                },
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM,
        temperature: 0.4,
        maxOutputTokens: 800,
      },
    });

    const finalText = (followUp.text ?? "").trim();

    const cards = result.matches.map(toCard);
    // Sumarle la distancia a cada card si la búsqueda fue geo-espacial
    if (result.distancesById) {
      for (const c of cards) {
        const d = result.distancesById[c.id];
        if (typeof d === "number") {
          (c as PropertyCard & { distanceMeters?: number }).distanceMeters = d;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      answer:
        finalText ||
        (result.matches.length > 0
          ? `Encontré ${result.matches.length} propiedades que matchean.`
          : "No encontré propiedades con esos criterios. ¿Querés flexibilizar algo (zona, presupuesto)?"),
      properties: cards,
      filters,
      total: result.total,
      referencePoint: result.referencePoint,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[ai/search] error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
