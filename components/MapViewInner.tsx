"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import type { MapViewProps } from "./MapView";
import { formatPrice } from "@/lib/utils";

const DEFAULT_CENTER = { lat: -34.6833, lng: -58.55 };
const DEFAULT_ZOOM = 13;

/**
 * Build a data-URI SVG pin for Google Maps. Using the legacy Marker
 * (not AdvancedMarker) keeps us from needing a Map ID — the trade-off
 * is less flexibility, but a pin is a pin.
 */
function pinIcon(highlighted: boolean): string {
  const color = highlighted ? "#ff4081" : "#e6007e";
  const w = highlighted ? 32 : 26;
  const h = highlighted ? 48 : 38;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="12" cy="12" r="4.5" fill="white"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function BoundsFitter({
  properties,
  singleMarker,
}: {
  properties: NonNullable<MapViewProps["properties"]>;
  singleMarker?: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map || singleMarker || properties.length === 0) return;
    if (typeof google === "undefined") return;
    const bounds = new google.maps.LatLngBounds();
    properties.forEach((p) => bounds.extend(p.location));
    map.fitBounds(bounds, 48);
  }, [map, properties, singleMarker]);
  return null;
}

export default function MapViewInner({
  properties = [],
  center,
  zoom,
  highlightedId = null,
  singleMarker = false,
  className = "",
}: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [openId, setOpenId] = useState<string | null>(null);

  const mapCenter = useMemo(() => {
    if (center) return { lat: center[0], lng: center[1] };
    if (singleMarker && properties.length === 1) {
      return properties[0].location;
    }
    if (properties.length > 0) {
      const avgLat =
        properties.reduce((s, p) => s + p.location.lat, 0) / properties.length;
      const avgLng =
        properties.reduce((s, p) => s + p.location.lng, 0) / properties.length;
      return { lat: avgLat, lng: avgLng };
    }
    return DEFAULT_CENTER;
  }, [center, properties, singleMarker]);

  const mapZoom = zoom ?? (singleMarker ? 15 : DEFAULT_ZOOM);
  const openProperty =
    openId ? properties.find((p) => p.id === openId) ?? null : null;

  if (!apiKey) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
      >
        <p className="text-gray-400 text-sm">
          Mapa no configurado (falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
        </p>
      </div>
    );
  }

  if (properties.length === 0 && !center) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
      >
        <p className="text-gray-400 text-sm">Sin ubicaciones para mostrar</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} language="es" region="AR">
      <div
        className={`relative w-full h-full rounded-lg overflow-hidden ${className}`}
        style={{ minHeight: 300 }}
      >
        <Map
          defaultCenter={mapCenter}
          defaultZoom={mapZoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={false}
          className="w-full h-full"
        >
          <BoundsFitter properties={properties} singleMarker={singleMarker} />

          {properties.map((property) => (
            <Marker
              key={property.id}
              position={property.location}
              icon={pinIcon(property.id === highlightedId)}
              zIndex={property.id === highlightedId ? 1000 : 1}
              onClick={() => !singleMarker && setOpenId(property.id)}
            />
          ))}

          {openProperty && !singleMarker && (
            <InfoWindow
              position={openProperty.location}
              onCloseClick={() => setOpenId(null)}
              pixelOffset={[0, -36]}
            >
              <div className="flex flex-col gap-1.5 min-w-[200px] max-w-[220px]">
                {openProperty.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={openProperty.images[0]}
                    alt={openProperty.title}
                    className="w-full h-24 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                    Sin imagen
                  </div>
                )}
                <p className="font-semibold text-sm text-gray-900">
                  {openProperty.currency === "ARS" ? "$" : "USD"}{" "}
                  {formatPrice(openProperty.price)}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {openProperty.address}
                </p>
                <a
                  href={`/propiedad/${openProperty.id}`}
                  className="text-xs font-semibold text-magenta hover:underline"
                >
                  Ver propiedad →
                </a>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
