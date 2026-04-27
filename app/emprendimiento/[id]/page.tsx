import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Maximize2,
  Home,
  Bath,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import Gallery from "@/components/Gallery";
import ContactSidebar from "@/components/ContactSidebar";
import MapView from "@/components/MapView";
import { fetchDevelopment, fetchDevelopmentIds } from "@/lib/xintel-developments";
import { listPicks } from "@/lib/picks";
import { formatPrice } from "@/lib/utils";
import type { DevelopmentStatus } from "@/data/types";

export async function generateStaticParams() {
  const ids = await fetchDevelopmentIds();
  return ids.map((id) => ({ id }));
}

const statusLabels: Record<DevelopmentStatus, string> = {
  "pre-venta": "Pre-venta",
  pozo: "Pozo",
  "en-construccion": "En construcción",
  terminado: "Terminado",
};

const statusColors: Record<DevelopmentStatus, string> = {
  "pre-venta": "bg-blue-500",
  pozo: "bg-amber-500",
  "en-construccion": "bg-orange-500",
  terminado: "bg-green-500",
};

export default async function DevelopmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [dev, hidden] = await Promise.all([
    fetchDevelopment(id),
    listPicks("development_hidden").catch((): string[] => []),
  ]);

  // Si el admin escondió este emprendimiento, no exponer la URL pública.
  if (dev && hidden.includes(dev.id)) {
    return (
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">
          Emprendimiento no disponible
        </h1>
      </main>
    );
  }

  if (!dev) {
    return (
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">
          Emprendimiento no encontrado
        </h1>
        <p className="text-gray-600 mb-6">
          El emprendimiento que buscás no existe o fue removido.
        </p>
        <Link
          href="/emprendimientos"
          className="inline-block rounded bg-magenta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-magenta-600"
        >
          Ver emprendimientos
        </Link>
      </main>
    );
  }

  const mapProperties = [
    {
      id: dev.id,
      title: dev.name,
      price: dev.priceFrom,
      address: dev.address,
      location: dev.location,
      images: dev.images,
    },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column (65%) */}
        <div className="w-full lg:w-[65%] space-y-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Emprendimientos", href: "/emprendimientos" },
              { label: dev.locality },
              { label: dev.name },
            ]}
          />

          {/* Heading */}
          <h1 className="text-3xl font-bold text-navy">{dev.name}</h1>

          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white ${statusColors[dev.status]}`}
            >
              {statusLabels[dev.status]}
            </span>
            <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
              Entrega estimada: {dev.deliveryDate}
            </span>
          </div>

          {/* Gallery */}
          <Gallery
            images={dev.images}
            videoUrl={dev.videoUrl}
            title={dev.name}
          />

          {/* Price range */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <p className="text-xl font-bold text-navy">
              Desde{" "}
              <span className="text-magenta">
                USD {formatPrice(dev.priceFrom)}
              </span>{" "}
              hasta{" "}
              <span className="text-magenta">
                USD {formatPrice(dev.priceTo)}
              </span>
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <FeatureItem
              icon={<Building2 className="h-5 w-5" />}
              value={String(dev.totalUnits)}
              label="Unidades"
            />
            <FeatureItem
              icon={<Building2 className="h-5 w-5" />}
              value={String(dev.availableUnits)}
              label="Disponibles"
            />
            <FeatureItem
              icon={<Maximize2 className="h-5 w-5" />}
              value={dev.areaRange}
              label="m2 Totales"
            />
            <FeatureItem
              icon={<Maximize2 className="h-5 w-5" />}
              value={dev.coveredAreaRange}
              label="m2 Cubiertos"
            />
            <FeatureItem
              icon={<Home className="h-5 w-5" />}
              value={dev.roomsRange}
              label="Ambientes"
            />
            <FeatureItem
              icon={<Bath className="h-5 w-5" />}
              value={String(dev.bathrooms)}
              label="Baños"
            />
            {dev.elevators && (
              <FeatureItem
                icon={<ArrowUpDown className="h-5 w-5" />}
                value={String(dev.elevators)}
                label="Ascensores"
              />
            )}
          </div>

          {/* Description */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-navy">
              Descripción
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {dev.description}
            </p>
          </section>

          {/* Amenities */}
          {dev.amenities.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-navy">
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {dev.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2.5 text-sm text-gray-700"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-magenta/10 text-magenta">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    {amenity}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Development details table */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-navy">
              Detalles del emprendimiento
            </h2>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-600 w-1/4">
                      Nombre
                    </td>
                    <td className="px-4 py-2.5 text-gray-800 w-1/4">
                      {dev.name}
                    </td>
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-600 w-1/4">
                      Categoría
                    </td>
                    <td className="px-4 py-2.5 text-gray-800 w-1/4">
                      {dev.category}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-600">
                      Tipo
                    </td>
                    <td className="px-4 py-2.5 text-gray-800">Edificio</td>
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-600">
                      Estado
                    </td>
                    <td className="px-4 py-2.5 text-gray-800">
                      {statusLabels[dev.status]}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-600">
                      Localidad
                    </td>
                    <td className="px-4 py-2.5 text-gray-800">
                      {dev.locality}
                    </td>
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-600">
                      Fecha entrega
                    </td>
                    <td className="px-4 py-2.5 text-gray-800">
                      {dev.deliveryDate}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-600">
                      Barrio
                    </td>
                    <td className="px-4 py-2.5 text-gray-800">
                      {dev.district}
                    </td>
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-600">
                      Administra
                    </td>
                    <td className="px-4 py-2.5 text-gray-800">
                      Russo Propiedades
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-600">
                      Dirección
                    </td>
                    <td className="px-4 py-2.5 text-gray-800">
                      {dev.address}
                    </td>
                    <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-600">
                      Ambientes
                    </td>
                    <td className="px-4 py-2.5 text-gray-800">
                      {dev.roomsRange}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Location / Map */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-navy">Ubicación</h2>
            <div className="h-80 rounded-lg overflow-hidden border border-gray-200">
              <MapView
                properties={mapProperties}
                center={[dev.location.lat, dev.location.lng]}
                zoom={15}
                singleMarker
                className="w-full h-full"
              />
            </div>
          </section>
        </div>

        {/* Right column (35%) */}
        <div className="w-full lg:w-[35%]">
          <ContactSidebar
            propertyCode={dev.code}
            propertyTitle={dev.name}
          />
        </div>
      </div>
    </main>
  );
}

function FeatureItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <span className="text-magenta">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-navy">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
