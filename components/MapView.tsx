"use client";

import dynamic from "next/dynamic";

export interface MapViewProps {
  properties?: Array<{
    id: string;
    title: string;
    price: number;
    address: string;
    location: { lat: number; lng: number };
    images: string[];
    operation?: string;
  }>;
  center?: [number, number];
  zoom?: number;
  highlightedId?: string | null;
  singleMarker?: boolean;
  className?: string;
}

const MapViewInner = dynamic(() => import("./MapViewInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
  ),
});

export default function MapView(props: MapViewProps) {
  return <MapViewInner {...props} />;
}
