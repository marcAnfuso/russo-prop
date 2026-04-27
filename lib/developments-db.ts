import { sql } from "./db";
import type { Development, DevelopmentStatus } from "@/data/types";
import { developments as seedData } from "@/data/developments";

// ── Schema ──────────────────────────────────────────────────────────────
// La tabla refleja 1:1 el tipo Development, con timestamps y autor del
// último cambio para auditoría básica desde el admin.
export async function ensureDevelopmentsSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS developments (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      locality TEXT NOT NULL,
      district TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL,
      delivery_date TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      price_from INT NOT NULL DEFAULT 0,
      price_to INT NOT NULL DEFAULT 0,
      total_units INT NOT NULL DEFAULT 0,
      available_units INT NOT NULL DEFAULT 0,
      rooms_range TEXT NOT NULL DEFAULT '',
      area_range TEXT NOT NULL DEFAULT '',
      covered_area_range TEXT NOT NULL DEFAULT '',
      bathrooms INT NOT NULL DEFAULT 0,
      amenities TEXT[] NOT NULL DEFAULT '{}',
      images TEXT[] NOT NULL DEFAULT '{}',
      video_url TEXT,
      lat DOUBLE PRECISION NOT NULL DEFAULT 0,
      lng DOUBLE PRECISION NOT NULL DEFAULT 0,
      elevators INT,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      sort_order INT NOT NULL DEFAULT 100,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_by TEXT
    )
  `;
  await db`
    CREATE INDEX IF NOT EXISTS idx_developments_featured
    ON developments (featured) WHERE featured = TRUE
  `;
  await seedFromHardcodedIfEmpty();
}

/**
 * Si la tabla está vacía y data/developments.ts tiene entries, las
 * volcamos para no perder la data inicial. Una sola vez.
 */
async function seedFromHardcodedIfEmpty(): Promise<void> {
  const db = sql();
  const rows = (await db`SELECT COUNT(*)::int AS n FROM developments`) as unknown as { n: number }[];
  if (rows[0].n > 0) return;
  for (const d of seedData) {
    await db`
      INSERT INTO developments (
        id, code, name, address, locality, district, description, status,
        delivery_date, category, price_from, price_to, total_units,
        available_units, rooms_range, area_range, covered_area_range,
        bathrooms, amenities, images, video_url, lat, lng, elevators,
        featured, updated_by
      ) VALUES (
        ${d.id}, ${d.code}, ${d.name}, ${d.address}, ${d.locality},
        ${d.district}, ${d.description}, ${d.status}, ${d.deliveryDate},
        ${d.category}, ${d.priceFrom}, ${d.priceTo}, ${d.totalUnits},
        ${d.availableUnits}, ${d.roomsRange}, ${d.areaRange},
        ${d.coveredAreaRange}, ${d.bathrooms}, ${d.amenities},
        ${d.images}, ${d.videoUrl ?? null}, ${d.location.lat},
        ${d.location.lng}, ${d.elevators ?? null}, ${d.featured},
        'seed'
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

// ── Row → Development mapping ───────────────────────────────────────────
interface DevelopmentRow {
  id: string;
  code: string;
  name: string;
  address: string;
  locality: string;
  district: string;
  description: string;
  status: string;
  delivery_date: string;
  category: string;
  price_from: number;
  price_to: number;
  total_units: number;
  available_units: number;
  rooms_range: string;
  area_range: string;
  covered_area_range: string;
  bathrooms: number;
  amenities: string[];
  images: string[];
  video_url: string | null;
  lat: number;
  lng: number;
  elevators: number | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

function rowToDevelopment(r: DevelopmentRow): Development {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    address: r.address,
    locality: r.locality,
    district: r.district,
    description: r.description,
    status: r.status as DevelopmentStatus,
    deliveryDate: r.delivery_date,
    category: r.category,
    priceFrom: r.price_from,
    priceTo: r.price_to,
    totalUnits: r.total_units,
    availableUnits: r.available_units,
    roomsRange: r.rooms_range,
    areaRange: r.area_range,
    coveredAreaRange: r.covered_area_range,
    bathrooms: r.bathrooms,
    amenities: r.amenities,
    images: r.images,
    videoUrl: r.video_url ?? undefined,
    location: { lat: Number(r.lat), lng: Number(r.lng) },
    elevators: r.elevators ?? undefined,
    featured: r.featured,
  };
}

// ── Public API ──────────────────────────────────────────────────────────
export async function listDevelopments(): Promise<Development[]> {
  await ensureDevelopmentsSchema();
  const db = sql();
  const rows = (await db`
    SELECT * FROM developments
    ORDER BY sort_order ASC, created_at DESC
  `) as unknown as DevelopmentRow[];
  return rows.map(rowToDevelopment);
}

export async function getDevelopment(id: string): Promise<Development | null> {
  await ensureDevelopmentsSchema();
  const db = sql();
  const rows = (await db`
    SELECT * FROM developments WHERE id = ${id} LIMIT 1
  `) as unknown as DevelopmentRow[];
  return rows[0] ? rowToDevelopment(rows[0]) : null;
}

export async function getDevelopmentIds(): Promise<string[]> {
  await ensureDevelopmentsSchema();
  const db = sql();
  const rows = (await db`SELECT id FROM developments`) as unknown as { id: string }[];
  return rows.map((r) => r.id);
}

export async function upsertDevelopment(
  d: Development,
  updatedBy: string
): Promise<void> {
  await ensureDevelopmentsSchema();
  const db = sql();
  await db`
    INSERT INTO developments (
      id, code, name, address, locality, district, description, status,
      delivery_date, category, price_from, price_to, total_units,
      available_units, rooms_range, area_range, covered_area_range,
      bathrooms, amenities, images, video_url, lat, lng, elevators,
      featured, updated_by
    ) VALUES (
      ${d.id}, ${d.code}, ${d.name}, ${d.address}, ${d.locality},
      ${d.district}, ${d.description}, ${d.status}, ${d.deliveryDate},
      ${d.category}, ${d.priceFrom}, ${d.priceTo}, ${d.totalUnits},
      ${d.availableUnits}, ${d.roomsRange}, ${d.areaRange},
      ${d.coveredAreaRange}, ${d.bathrooms}, ${d.amenities},
      ${d.images}, ${d.videoUrl ?? null}, ${d.location.lat},
      ${d.location.lng}, ${d.elevators ?? null}, ${d.featured}, ${updatedBy}
    )
    ON CONFLICT (id) DO UPDATE SET
      code = EXCLUDED.code,
      name = EXCLUDED.name,
      address = EXCLUDED.address,
      locality = EXCLUDED.locality,
      district = EXCLUDED.district,
      description = EXCLUDED.description,
      status = EXCLUDED.status,
      delivery_date = EXCLUDED.delivery_date,
      category = EXCLUDED.category,
      price_from = EXCLUDED.price_from,
      price_to = EXCLUDED.price_to,
      total_units = EXCLUDED.total_units,
      available_units = EXCLUDED.available_units,
      rooms_range = EXCLUDED.rooms_range,
      area_range = EXCLUDED.area_range,
      covered_area_range = EXCLUDED.covered_area_range,
      bathrooms = EXCLUDED.bathrooms,
      amenities = EXCLUDED.amenities,
      images = EXCLUDED.images,
      video_url = EXCLUDED.video_url,
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      elevators = EXCLUDED.elevators,
      featured = EXCLUDED.featured,
      updated_at = now(),
      updated_by = EXCLUDED.updated_by
  `;
}

export async function deleteDevelopment(id: string): Promise<void> {
  await ensureDevelopmentsSchema();
  const db = sql();
  await db`DELETE FROM developments WHERE id = ${id}`;
}
