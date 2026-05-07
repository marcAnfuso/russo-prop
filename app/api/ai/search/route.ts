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
import { hashIp, logRussiaUsage } from "@/lib/russia-logs";

function getClientIp(req: NextRequest): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export const maxDuration = 30;

const POI_LIST = listPOILabels().join(", ");

const SYSTEM = `Sos Russia, la asistente de IA de Russo Propiedades, una inmobiliaria de zona oeste (Buenos Aires, Argentina) con más de 30 años de experiencia.

Tu trabajo es ayudar al usuario a encontrar la propiedad ideal en el catálogo de Russo. Tenés DOS herramientas:

1. **search_properties**: búsqueda general por filtros.
2. **search_properties_near**: búsqueda geo-espacial. Usala cuando el usuario mencione un punto de referencia ("cerca de la estación de Ramos", "a X cuadras del hospital Paroissien", "cerca de UNLaM", "próximo a Av. Perón 3500"). Combinable con todos los demás filtros + zona (zones).

Si menciona zona Y punto de referencia ("en San Justo cerca de la estación"), pasá AMBOS a search_properties_near · primero filtramos por zona, después por distancia.

PUNTOS DE INTERÉS conocidos (zona oeste, gratis): ${POI_LIST}.

Si el punto NO está en esa lista, igual usá search_properties_near · hay fallback automático a geocodificación.

═══════════════════════════════════════════════════════════
REGLAS CRÍTICAS DE EXTRACCIÓN DE FILTROS
═══════════════════════════════════════════════════════════

🎯 EXACTO vs RANGO (muy importante para no devolver propiedades incorrectas):

| Frase del usuario | Filtro a usar |
|---|---|
| "3 ambientes" / "depto de 3 ambientes" | roomsExact: 3 |
| "al menos 3 ambientes" / "3 o más" | roomsMin: 3 |
| "hasta 3 ambientes" / "máximo 3" | roomsMax: 3 |
| "entre 2 y 4 ambientes" | roomsMin: 2, roomsMax: 4 |
| "monoambiente" | roomsExact: 1 |
| "dos dormitorios" / "2 dormitorios" | bedroomsExact: 2 |
| "3 baños" | bathroomsExact: 3 |
| "con cochera" | hasGarage: true (cualquier cantidad) |
| "cochera doble" / "2 cocheras" | garageMin: 2 |
| "a estrenar" / "nueva" / "sin estrenar" / "primera mano" | ageMax: 0 (SIEMPRE — incluso si combinas con otros filtros) |
| "menos de 10 años" | ageMax: 10 |
| "100 m² mínimo" | areaMin: 100 |
| "entre 50 y 80 m²" | areaMin: 50, areaMax: 80 |

🎯 OPERACIÓN:
- "comprar", "venta", "compra" → operation: "venta"
- "alquilar", "alquiler", "renta" → operation: "alquiler"
- Si no especifica, OMITIR (no asumas) · search_properties devolverá ambas.

🎯 TIPOS:
- "casa" → casa · "departamento", "depto" → departamento · "PH" → ph
- "terreno", "lote" → terreno · "local" → local · "oficina" → oficina
- "galpón" → galpon · "edificio" → edificio · "quinta" → quinta · "campo" → campo

🎯 PRECIO:
- "hasta 100 mil USD" / "menos de 100k" → priceMax: 100000, priceCurrency: "USD"
- "hasta 500 mil pesos" / "$500.000" → priceMax: 500000, priceCurrency: "ARS"
- "1.5 millones USD" / "1.5m" / "1.5 millones de dólares" → priceMax: 1500000, priceCurrency: "USD"
- Si dice solo "hasta 100k" sin moneda Y la operación es venta → asumir USD.
- Si dice solo "hasta 100k" sin moneda Y la operación es alquiler → asumir ARS.

🎯 AMENITIES (matchean por substring case-insensitive contra p.amenities):
- "con piscina" / "con pileta" → amenities: ["piscina"]
- "con balcón" → amenities: ["balcón"]
- "con balcón al frente" → amenities: ["balcón"] · el detalle "al frente" lo aclarás en la respuesta
- "con parrilla" → amenities: ["parrilla"]
- "con sum" → amenities: ["sum"]
- "amueblado" → amenities: ["amueblado"]
- "con patio" → amenities: ["patio"]
- "con quincho" → amenities: ["quincho"]
- "con jardín" → amenities: ["jardín"]
- "con cochera doble" → garageMin: 2 (NO uses amenities)

🎯 FORMA DE PAGO:
- "apto crédito" / "apta para crédito" / "se puede con crédito" / "apta hipoteca" → aptoCredito: true
- "apto financiación" / "con plan de pago" / "con cuotas" / "financia Russo" → aptoFinanciacion: true
- "apto permuta" / "aceptan permuta" / "permuto mi depto" / "cambio mi casa por…" → aptoPermuta: true
- Pueden combinarse: "casa apta crédito y permuta en San Justo" → aptoCredito: true, aptoPermuta: true

🎯 SUBTYPES (van a "types" cuando son específicos):
- "monoambiente" → types: ["departamento"], roomsExact: 1
- "dúplex" / "duplex" / "tríplex" → types: ["departamento"]
- "loft" → types: ["departamento"]
- "semipiso" / "piso" → types: ["departamento"]
- "ph" / "p.h." → types: ["ph"] (NO departamento)

🎯 ORDEN DE RESULTADOS (sortBy):
- "los más baratos" / "menor precio" / "más económicos" → sortBy: "price_asc"
- "los más caros" / "mayor precio" / "más exclusivos" → sortBy: "price_desc"
- "los más nuevos" / "recién entrados" → sortBy: "newest"
- "los más grandes" / "mayor superficie" → sortBy: "area_desc"
- "los más chicos" / "menor superficie" → sortBy: "area_asc"
- Si NO menciona orden, OMITIR sortBy · usamos prioridad por defecto (lo que el equipo Russo recomienda).

🎯 EJEMPLOS COMPLETOS (cómo extraer múltiples filtros en una sola llamada):

User: "Casa con cochera doble en San Justo a estrenar"
→ search_properties({ types: ["casa"], zones: ["San Justo"], garageMin: 2, ageMax: 0 })

User: "Depto a estrenar con balcón en Ramos hasta 150k USD"
→ search_properties({ types: ["departamento"], zones: ["Ramos Mejía"], amenities: ["balcón"], ageMax: 0, priceMax: 150000, priceCurrency: "USD" })

User: "Los más baratos terrenos a estrenar en Villa Luzuriaga"
→ search_properties({ types: ["terreno"], zones: ["Villa Luzuriaga"], ageMax: 0, sortBy: "price_asc" })

⚠️ NUNCA omitas un filtro que el usuario menciona explícitamente. Si dice "a estrenar", incluí ageMax: 0 SIEMPRE, incluso si la búsqueda termina sin resultados — el usuario quiere ver SI hay propiedades con esa característica.

🎯 PUNTO DE REFERENCIA (para search_properties_near):
- "cerca de X" / "próximo a X" / "a Y cuadras de X" → referencePoint: "X"
- 1 cuadra ≈ 100m. "5 cuadras" → radiusMeters: 500. "10 cuadras" → 1000.
- Si no aclara distancia, default 1500m (~12 cuadras).

🎯 TEXTO LIBRE (calle / código RUS):
- Si menciona una calle pero no es punto de interés ("Salta", "Av. Perón 3500") → text: "<calle>" en search_properties.
- Códigos RUS ("RUS10989") → text: "<código>".
- Pero si dice "cerca de Av. Perón 3500" → search_properties_near con referencePoint: "Av. Perón 3500".

ZONAS válidas (usá los nombres oficiales · NUNCA inventes una zona):
San Justo, Ramos Mejía, Villa Luzuriaga, Haedo, Morón, Ciudadela, Caseros, La Tablada, Isidro Casanova, González Catán, Tapiales, Rafael Castillo, Lomas del Mirador, Aldo Bonzi, La Matanza, Villa Sarmiento, Villa Madero, Villa Tesei, Castelar, Ituzaingó, El Palomar.

⚠️ "Zona oeste", "el oeste", "Gran Buenos Aires Oeste", "GBA Oeste" → NO son zonas válidas para el filtro zones. Son la región general donde opera Russo. Si el usuario los menciona, OMITÍ el filtro zones (todo el catálogo es zona oeste de todos modos).

⚠️ "La Matanza" es un partido grande que incluye varias zonas. Si dicen "La Matanza" sin más contexto, podés usarla pero aclarale al usuario que abarca varias localidades y ofrecele filtrar por una específica.

═══════════════════════════════════════════════════════════
CUÁNDO BUSCAR vs CUÁNDO PEDIR MÁS INFO
═══════════════════════════════════════════════════════════

🎯 REGLA DE ORO: si el mensaje del usuario contiene AL MENOS UN dato concreto (zona, tipo, presupuesto, ambientes, punto de referencia, amenity, modificador como "a estrenar"), **LLAMÁ SIEMPRE a la función de búsqueda**. NO pidas aclaración. Es mejor traer 0 resultados con honestidad que pedir más info y frustrar al usuario.

🎯 BUSCÁ DIRECTO si tenés AL MENOS uno de estos: zona, tipo de propiedad, presupuesto, ambientes, punto de referencia, o amenities específicos.

Ejemplos que tienen suficiente info para buscar:
- "Casa con piscina en Villa Luzuriaga" → SÍ buscar (zona + tipo + amenity)
- "PH con patio hasta 150k USD" → SÍ buscar (tipo + amenity + presupuesto, aunque falte zona)
- "Departamento en Ramos" → SÍ buscar (tipo + zona)
- "Algo barato cerca de UNLaM" → SÍ buscar (sort + ref point)

🎯 PEDÍ ACLARACIÓN solo si es genuinamente ambiguo:
- "Algo lindo" → pedí 1 dato concreto.
- "Quiero comprar" → preguntá tipo o zona.
- Mensaje vacío de criterios.

═══════════════════════════════════════════════════════════
REGLAS DE RESPUESTA
═══════════════════════════════════════════════════════════

- Castellano rioplatense (voseo OK), sin emojis excesivos. Sé cálida pero profesional.
- Texto corto (1-3 oraciones) · las propiedades se renderean como cards aparte, no las listes una por una en el texto.
- Después de una búsqueda exitosa: "Encontré X propiedades en zona Y..." y sugerí refinar ("¿Querés que filtre por cochera o algo específico?").
- **CUANDO ES GEO-SEARCH** (search_properties_near): mencioná en el texto el rango de distancias del punto de referencia. Ejemplo: "Te muestro 5 deptos cerca de la estación de Ramos · el más cercano a 107m, el más lejos a 1.2km." Esto ayuda a que el usuario sepa de un vistazo qué tan cerca o lejos está cada uno.
- Si la búsqueda devuelve 0: decílo honestamente y sugerí flexibilizar (ampliar zonas, subir presupuesto, sacar un filtro). NUNCA inventes propiedades.
- Si los criterios son muy ambiguos ("algo lindo"), pedí 1 dato concreto antes de buscar.
- Si el usuario te pide algo no inmobiliario, redireccioná amable.
- Si pregunta por contacto: WhatsApp +54 11 5018 7340, info@russopropiedades.com.ar, sedes en San Justo (Pte. Perón 3501) y Ramos Mejía (Belgrano 123, próxima apertura).
- Si el usuario te pregunta algo no inmobiliario, redireccioná amablemente.`;

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface RequestBody {
  message: string;
  history?: ChatMessage[];
  session_id?: string;
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
          zones: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "Zonas/localidades adicionales a aplicar como filtro. Si el usuario dijo 'en San Justo cerca de la estación', poner ['San Justo'] aquí Y referencePoint: 'estación de San Justo'.",
          },
          types: { type: Type.ARRAY, items: { type: Type.STRING } },
          priceMax: { type: Type.NUMBER },
          priceMin: { type: Type.NUMBER },
          priceCurrency: { type: Type.STRING, enum: ["USD", "ARS"] },
          roomsExact: { type: Type.NUMBER, description: "Ambientes exactos. '3 ambientes' → 3." },
          roomsMin: { type: Type.NUMBER },
          roomsMax: { type: Type.NUMBER },
          bedroomsExact: { type: Type.NUMBER, description: "Dormitorios exactos." },
          bedroomsMin: { type: Type.NUMBER },
          bedroomsMax: { type: Type.NUMBER },
          bathroomsExact: { type: Type.NUMBER },
          bathroomsMin: { type: Type.NUMBER },
          garageMin: { type: Type.NUMBER, description: "Cocheras mínimas. 'Cochera doble' → 2." },
          hasGarage: { type: Type.BOOLEAN },
          ageMax: { type: Type.NUMBER, description: "Antigüedad máxima en años. 'A estrenar' → 0." },
          areaMin: { type: Type.NUMBER, description: "Superficie mínima en m²." },
          areaMax: { type: Type.NUMBER },
          hasVideo: { type: Type.BOOLEAN },
          aptoCredito: { type: Type.BOOLEAN, description: "Apto crédito hipotecario." },
          aptoFinanciacion: { type: Type.BOOLEAN, description: "Apto financiación / cuotas con Russo." },
          aptoPermuta: { type: Type.BOOLEAN, description: "Apto permuta · acepta otra propiedad como pago." },
          amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
          sortBy: {
            type: Type.STRING,
            enum: ["price_asc", "price_desc", "newest", "area_desc", "area_asc"],
            description:
              "Orden. Si el usuario pidió 'los más baratos' → price_asc. 'Los más caros' → price_desc. 'Los más nuevos' → newest. 'Los más grandes' → area_desc. Sin orden explícito → omitir.",
          },
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
          roomsExact: {
            type: Type.NUMBER,
            description:
              "Ambientes EXACTOS. Si el usuario dice '3 ambientes' usar este (no roomsMin), así no devuelve de 4.",
          },
          roomsMin: { type: Type.NUMBER, description: "Ambientes mínimos. Solo si dice 'al menos N' o 'N o más'." },
          roomsMax: { type: Type.NUMBER, description: "Ambientes máximos." },
          bedroomsExact: { type: Type.NUMBER, description: "Dormitorios exactos." },
          bedroomsMin: { type: Type.NUMBER },
          bedroomsMax: { type: Type.NUMBER },
          bathroomsExact: { type: Type.NUMBER },
          bathroomsMin: { type: Type.NUMBER },
          garageMin: {
            type: Type.NUMBER,
            description: "Cocheras mínimas. 'Cochera doble' o '2 cocheras' → 2. 'Triple' → 3.",
          },
          hasGarage: {
            type: Type.BOOLEAN,
            description: "Si pidió 'con cochera' sin especificar cantidad. Mutuamente excluyente con garageMin.",
          },
          ageMax: {
            type: Type.NUMBER,
            description: "Antigüedad máxima en años. 'A estrenar' → 0. 'Hasta 5 años' → 5.",
          },
          areaMin: { type: Type.NUMBER, description: "Superficie cubierta mínima (m²)." },
          areaMax: { type: Type.NUMBER },
          hasVideo: {
            type: Type.BOOLEAN,
            description: "Si pidió propiedades con video/tour.",
          },
          aptoCredito: {
            type: Type.BOOLEAN,
            description:
              "Si pidió 'apto crédito', 'que se pueda con crédito', 'apta para crédito hipotecario'.",
          },
          aptoFinanciacion: {
            type: Type.BOOLEAN,
            description:
              "Si pidió 'apto financiación', 'con plan de pago', 'con cuotas', 'que tenga financiación'.",
          },
          aptoPermuta: {
            type: Type.BOOLEAN,
            description:
              "Si pidió 'apto permuta', 'que acepten permuta', 'permuto mi depto', 'cambio mi propiedad'.",
          },
          amenities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              'Amenities deseados (substring match): "piscina", "balcón", "parrilla", "sum", "amueblado", "patio", "quincho", "jardín".',
          },
          text: {
            type: Type.STRING,
            description:
              "Texto libre para matchear contra dirección/calle/código RUS si el usuario menciona una calle ('Salta', 'Av. Perón 3500') o código RUS.",
          },
          sortBy: {
            type: Type.STRING,
            enum: ["price_asc", "price_desc", "newest", "area_desc", "area_asc"],
            description:
              "Orden. 'Más baratos' → price_asc. 'Más caros' → price_desc. 'Más nuevos' → newest. 'Más grandes' → area_desc. 'Más chicos' → area_asc. Sin orden explícito → omitir.",
          },
        },
      },
    },
  ],
};

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const body = (await req.json().catch(() => ({}))) as RequestBody;
  const userMessage = (body.message || "").trim();
  const history = body.history ?? [];
  const sessionId = body.session_id ?? null;

  const ipHash = hashIp(getClientIp(req));
  const userAgent = req.headers.get("user-agent");

  // Acumulamos info a lo largo del handler. Se loguea en finally,
  // fire-and-forget · no rompe la respuesta si la DB está caída.
  const logCtx = {
    responseExcerpt: null as string | null,
    functionCall: null as string | null,
    functionArgs: null as unknown,
    resultCount: null as number | null,
    error: null as string | null,
    inputTokens: null as number | null,
    outputTokens: null as number | null,
  };

  if (!userMessage) {
    await logRussiaUsage({
      sessionId, ipHash, userAgent, userMessage: "(empty)", ...logCtx,
      error: "missing message", ms: Date.now() - startedAt,
    });
    return NextResponse.json(
      { ok: false, error: "missing message" },
      { status: 400 }
    );
  }
  if (userMessage.length > 500) {
    await logRussiaUsage({
      sessionId, ipHash, userAgent, userMessage, ...logCtx,
      error: "message too long", ms: Date.now() - startedAt,
    });
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
        temperature: 0.15,
        maxOutputTokens: 1500,
        tools: [SEARCH_TOOL],
      },
    });

    const candidate = firstRes.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    const fnCall = parts.find((p) => p.functionCall)?.functionCall;

    // Capturar tokens del primer call para el log
    const firstUsage = firstRes.usageMetadata;
    if (firstUsage) {
      logCtx.inputTokens = (logCtx.inputTokens ?? 0) + (firstUsage.promptTokenCount ?? 0);
      logCtx.outputTokens = (logCtx.outputTokens ?? 0) + (firstUsage.candidatesTokenCount ?? 0);
    }

    // Si Gemini decidió responder sin búsqueda
    if (!fnCall) {
      const answer = (firstRes.text ?? "").trim();
      logCtx.responseExcerpt = answer.slice(0, 300);
      logCtx.resultCount = 0;
      await logRussiaUsage({
        sessionId, ipHash, userAgent, userMessage, ...logCtx,
        ms: Date.now() - startedAt,
      });
      return NextResponse.json({
        ok: true,
        answer: answer || "¿Podés contarme un poco más sobre lo que buscás?",
        properties: [],
      });
    }

    // Ejecutar la búsqueda · routing por nombre de la función
    const args = (fnCall.args ?? {}) as Record<string, unknown>;
    logCtx.functionCall = fnCall.name ?? null;
    logCtx.functionArgs = args;
    const result =
      fnCall.name === "search_properties_near"
        ? await searchPropertiesNear(args as unknown as NearSearchInput, 5)
        : await searchProperties(args as SearchFilters, 5);
    const filters = args;
    logCtx.resultCount = result.matches.length;

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
    logCtx.responseExcerpt = finalText.slice(0, 300);

    // Sumar tokens del segundo call
    const secondUsage = followUp.usageMetadata;
    if (secondUsage) {
      logCtx.inputTokens = (logCtx.inputTokens ?? 0) + (secondUsage.promptTokenCount ?? 0);
      logCtx.outputTokens = (logCtx.outputTokens ?? 0) + (secondUsage.candidatesTokenCount ?? 0);
    }

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

    await logRussiaUsage({
      sessionId, ipHash, userAgent, userMessage, ...logCtx,
      ms: Date.now() - startedAt,
    });

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
    logCtx.error = msg;
    await logRussiaUsage({
      sessionId, ipHash, userAgent, userMessage, ...logCtx,
      ms: Date.now() - startedAt,
    });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
