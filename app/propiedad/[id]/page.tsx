import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Maximize2,
  LandPlot,
  Home,
  Bath,
  BedDouble,
  Car,
  Calendar,
} from "lucide-react";
import { fetchProperty, fetchPropertyIds } from "@/lib/xintel";
import type { Property } from "@/data/types";
import { formatPrice } from "@/lib/utils";
import Gallery from "@/components/Gallery";
import AmenityList from "@/components/AmenityList";
import AIHighlights from "@/components/AIHighlights";
import RussiaChatWidget from "@/components/RussiaChatWidget";
import PropertyDetailsTable from "@/components/PropertyDetailsTable";
import AreaMeasurementsTable from "@/components/AreaMeasurementsTable";
import DetailHeaderActions from "@/components/DetailHeaderActions";
import ContactSidebar from "@/components/ContactSidebar";
import MapView from "@/components/MapView";
import Breadcrumb from "@/components/Breadcrumb";
import SimilarProperties from "@/components/SimilarProperties";
import { fetchProperties } from "@/lib/xintel";

export async function generateStaticParams() {
  const ids = await fetchPropertyIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchProperty(id);
  if (!property) return { title: "Propiedad no encontrada" };

  const priceLabel = property.price === 9999999
    ? "Reservado"
    : `${property.currency === "ARS" ? "$" : "USD"} ${formatPrice(property.price)}`;

  const title = `${property.type.charAt(0).toUpperCase() + property.type.slice(1)} en ${property.operation === "alquiler" ? "Alquiler" : "Venta"} — ${priceLabel}`;
  const description = `${property.address}, ${property.locality}. ${property.features.rooms ? property.features.rooms + " amb." : ""} ${property.features.totalArea ? property.features.totalArea + " m²" : ""}`.trim();

  return {
    title,
    description,
    openGraph: {
      title: `${priceLabel} — ${property.address}`,
      description: description.slice(0, 160),
      images: property.images[0] ? [{ url: property.images[0], width: 1200, height: 630 }] : [],
      type: "website",
    },
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await fetchProperty(id);
  const { properties: allProperties } = await fetchProperties({
    operation: property?.operation ?? "venta",
    page: 1,
  });

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-navy">
          Propiedad no encontrada
        </h1>
        <p className="text-gray-500">
          La propiedad que buscás no existe o fue removida.
        </p>
        <Link
          href="/ventas"
          className="rounded bg-magenta px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-magenta-600"
        >
          Ver propiedades en venta
        </Link>
      </div>
    );
  }

  const isAlquiler = property.operation === "alquiler";
  const operationLabel = isAlquiler ? "Alquiler" : "Venta";
  const operationHref = isAlquiler ? "/alquileres" : "/ventas";

  // Capitalize type
  const typeLabel =
    property.type.charAt(0).toUpperCase() + property.type.slice(1);

  const breadcrumbItems = [
    { label: isAlquiler ? "Alquilar" : "Comprar", href: operationHref },
    { label: typeLabel, href: operationHref },
    { label: property.locality, href: operationHref },
    { label: property.code },
  ];

  // Build features list
  const featureItems: {
    icon: React.ReactNode;
    value: string;
    label: string;
  }[] = [];

  if (property.features.totalArea) {
    featureItems.push({
      icon: <Maximize2 className="h-5 w-5 text-magenta" />,
      value: `${property.features.totalArea}`,
      label: "m\u00B2 totales",
    });
  }
  if (property.features.coveredArea) {
    featureItems.push({
      icon: <Maximize2 className="h-5 w-5 text-magenta" />,
      value: `${property.features.coveredArea}`,
      label: "m\u00B2 cubiertos",
    });
  }
  if (property.features.landArea) {
    featureItems.push({
      icon: <LandPlot className="h-5 w-5 text-magenta" />,
      value: `${property.features.landArea}`,
      label: "m\u00B2 terreno",
    });
  }
  if (property.features.rooms) {
    featureItems.push({
      icon: <Home className="h-5 w-5 text-magenta" />,
      value: `${property.features.rooms}`,
      label: "Ambientes",
    });
  }
  if (property.features.bathrooms) {
    featureItems.push({
      icon: <Bath className="h-5 w-5 text-magenta" />,
      value: `${property.features.bathrooms}`,
      label: "Baños",
    });
  }
  if (property.features.bedrooms) {
    featureItems.push({
      icon: <BedDouble className="h-5 w-5 text-magenta" />,
      value: `${property.features.bedrooms}`,
      label: "Dormitorios",
    });
  }
  if (property.features.garage) {
    featureItems.push({
      icon: <Car className="h-5 w-5 text-magenta" />,
      value: `${property.features.garage}`,
      label: "Cocheras",
    });
  }
  if (property.features.age != null) {
    featureItems.push({
      icon: <Calendar className="h-5 w-5 text-magenta" />,
      value: `${property.features.age}`,
      label: "Antigüedad",
    });
  }

  const mapProperty = {
    id: property.id,
    title: property.title,
    price: property.price,
    address: property.address,
    location: property.location,
    images: property.images,
    operation: property.operation,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: property.title,
            description: property.description,
            url: `https://russopropiedades.com.ar/propiedad/${property.id}`,
            image: property.images[0],
            address: {
              "@type": "PostalAddress",
              streetAddress: property.address,
              addressLocality: property.locality,
              addressRegion: property.district,
              addressCountry: "AR",
            },
            offers: {
              "@type": "Offer",
              price: property.price === 9999999 ? undefined : property.price,
              priceCurrency: property.currency,
              availability:
                property.price === 9999999
                  ? "https://schema.org/SoldOut"
                  : "https://schema.org/InStock",
            },
          }),
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column */}
        <div className="w-full lg:w-[65%] space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Title + actions row */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-navy md:text-3xl">
              {property.title}
            </h1>
            <DetailHeaderActions
              propertyId={property.id}
              title={property.title}
            />
          </div>

          {/* Gallery */}
          <Gallery
            images={property.images}
            videoUrl={property.videoUrl}
            plans={property.plans}
            title={property.title}
          />

          {/* Operation badge */}
          <div>
            <span
              className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-white ${
                isAlquiler ? "bg-navy" : "bg-magenta"
              }`}
            >
              {operationLabel}
            </span>
          </div>

          {/* Price */}
          <p className="text-3xl font-bold text-gray-900">
            {property.currency === "ARS" ? "$" : "USD"} {formatPrice(property.price)}{isAlquiler ? "/mes" : ""}
          </p>

          {/* Features grid */}
          {featureItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featureItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                >
                  {item.icon}
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {item.value}
                    </p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI-generated highlights — 4-6 bullets drawn from the Xintel
              description + features, cached in Postgres. */}
          <AIHighlights propertyId={property.id} />

          {/* Description */}
          {property.description && (
            <section>
              <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-navy mb-3">
                <span className="h-6 w-1 rounded-full bg-magenta" aria-hidden="true" />
                Descripción
              </h2>
              <div
                className="description-html text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: property.description }}
              />
            </section>
          )}

          {/* Detalles de la propiedad */}
          <PropertyDetailsTable property={property} />

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <section>
              <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-navy mb-6">
                <span className="h-6 w-1 rounded-full bg-magenta" aria-hidden="true" />
                Características
              </h2>
              <AmenityList items={property.amenities} />
            </section>
          )}

          {/* Medidas */}
          {property.areas && property.areas.length > 0 && (
            <AreaMeasurementsTable areas={property.areas} />
          )}

          {/* Location / Map */}
          <section>
            <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-navy mb-3">
              <span className="h-6 w-1 rounded-full bg-magenta" aria-hidden="true" />
              Ubicación
            </h2>
            <p className="text-gray-700 mb-4">
              {property.address}
              {property.locality ? `, ${property.locality}` : ""}
              {property.district ? `, ${property.district}` : ""}
            </p>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <MapView
                properties={[mapProperty]}
                center={[property.location.lat, property.location.lng]}
                zoom={15}
                singleMarker
                className="h-full w-full"
              />
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="w-full lg:w-[35%]">
          <ContactSidebar
            propertyCode={property.code}
            propertyTitle={property.title}
          />
        </div>
      </div>

      {/* Similar properties - full width below */}
      <div className="mt-12">
        <SimilarProperties
          currentProperty={property}
          allProperties={allProperties}
        />
      </div>
    </div>
    {/* Widget flotante de chat con la IA — aparece bottom-left en toda
        la página de detalle, con avatar + burbuja de bienvenida. */}
    <RussiaChatWidget propertyId={property.id} />
    </>
  );
}
