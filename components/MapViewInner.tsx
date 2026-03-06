"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapViewProps } from "./MapView";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_CENTER: [number, number] = [-34.6833, -58.55];
const DEFAULT_ZOOM = 13;

/* ------------------------------------------------------------------ */
/*  Marker icons                                                       */
/* ------------------------------------------------------------------ */

function pinSvg(color: string, scale = 1): string {
  const w = Math.round(24 * scale);
  const h = Math.round(36 * scale);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 24 36">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`;
}

function createIcon(highlighted = false): L.DivIcon {
  const color = highlighted ? "#ff4081" : "#d6336c";
  const scale = highlighted ? 1.35 : 1;
  const w = Math.round(24 * scale);
  const h = Math.round(36 * scale);

  return L.divIcon({
    html: pinSvg(color, scale),
    className: "",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h],
  });
}

const defaultIcon = createIcon(false);
const highlightedIcon = createIcon(true);

/* ------------------------------------------------------------------ */
/*  Helper: format price                                               */
/* ------------------------------------------------------------------ */

function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/* ------------------------------------------------------------------ */
/*  Sub-component: auto-fit bounds when properties change              */
/* ------------------------------------------------------------------ */

interface BoundsUpdaterProps {
  properties: NonNullable<MapViewProps["properties"]>;
  singleMarker?: boolean;
}

function BoundsUpdater({ properties, singleMarker }: BoundsUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (singleMarker || properties.length === 0) return;

    const bounds = L.latLngBounds(
      properties.map((p) => [p.location.lat, p.location.lng] as [number, number])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [map, properties, singleMarker]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  Main inner component                                               */
/* ------------------------------------------------------------------ */

export default function MapViewInner({
  properties = [],
  center,
  zoom,
  highlightedId = null,
  singleMarker = false,
  className = "",
}: MapViewProps) {
  const markerRefs = useRef<Record<string, L.Marker>>({});

  /* Compute map center */
  const mapCenter = useMemo<[number, number]>(() => {
    if (center) return center;
    if (singleMarker && properties.length === 1) {
      return [properties[0].location.lat, properties[0].location.lng];
    }
    if (properties.length > 0) {
      const avgLat =
        properties.reduce((s, p) => s + p.location.lat, 0) / properties.length;
      const avgLng =
        properties.reduce((s, p) => s + p.location.lng, 0) / properties.length;
      return [avgLat, avgLng];
    }
    return DEFAULT_CENTER;
  }, [center, properties, singleMarker]);

  const mapZoom = zoom ?? DEFAULT_ZOOM;

  /* Update highlighted marker icon */
  useEffect(() => {
    for (const [id, marker] of Object.entries(markerRefs.current)) {
      if (marker) {
        marker.setIcon(id === highlightedId ? highlightedIcon : defaultIcon);
        if (id === highlightedId) {
          marker.setZIndexOffset(1000);
        } else {
          marker.setZIndexOffset(0);
        }
      }
    }
  }, [highlightedId]);

  const setMarkerRef = useCallback(
    (id: string) => (ref: L.Marker | null) => {
      if (ref) {
        markerRefs.current[id] = ref;
      } else {
        delete markerRefs.current[id];
      }
    },
    []
  );

  /* Empty state */
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
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom
      className={`w-full h-full rounded-lg z-0 ${className}`}
      style={{ minHeight: 300 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <BoundsUpdater properties={properties} singleMarker={singleMarker} />

      {properties.map((property) => {
        const position: [number, number] = [
          property.location.lat,
          property.location.lng,
        ];

        return (
          <Marker
            key={property.id}
            position={position}
            icon={
              property.id === highlightedId ? highlightedIcon : defaultIcon
            }
            ref={setMarkerRef(property.id)}
          >
            {!singleMarker && (
              <Popup>
                <div className="flex flex-col gap-1 min-w-[180px]">
                  {property.images[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                      Sin imagen
                    </div>
                  )}
                  <p className="font-semibold text-sm text-gray-900">
                    USD {formatPrice(property.price)}
                  </p>
                  <p className="text-xs text-gray-600">{property.address}</p>
                  <a
                    href={`/propiedades/${property.id}`}
                    className="text-xs text-magenta-600 hover:underline mt-1 font-medium"
                  >
                    Ver propiedad
                  </a>
                </div>
              </Popup>
            )}
          </Marker>
        );
      })}
    </MapContainer>
  );
}
