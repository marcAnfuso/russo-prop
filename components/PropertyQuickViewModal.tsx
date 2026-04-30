"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2, Home, Droplets, Car, Loader2 } from "lucide-react";
import type { Property } from "@/data/types";
import ContactButtons from "@/components/ContactButtons";
import { formatPrice } from "@/lib/utils";

interface PropertyQuickViewModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyQuickViewModal({
  property,
  isOpen,
  onClose,
}: PropertyQuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullImages, setFullImages] = useState<string[] | null>(null);

  // Reset image index and lock body scroll when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setCurrentImageIndex(0);
    setFullImages(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Lazy fetch · el listing pasa sólo 1 imagen (toListProperty) para no
  // hinchar el HTML. Cuando se abre el modal traemos las completas.
  useEffect(() => {
    if (!isOpen || !property) return;
    let cancelled = false;
    fetch(`/api/properties/${property.id}/images`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.images) return;
        if (Array.isArray(data.images) && data.images.length > 1) {
          setFullImages(data.images);
        }
      })
      .catch(() => {
        // silencioso · si falla mostramos sólo la imagen del listing
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, property]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  const { code, price, currency, address, locality, district, features } = property;
  const images = fullImages ?? property.images;
  const currencyLabel = currency === "ARS" ? "$" : "USD";
  const priceLabel =
    price === 9999999
      ? "Reservado"
      : `${currencyLabel} ${formatPrice(price)}`;

  const currentImage = images[currentImageIndex] || images[0];

  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_40px_120px_-20px_rgba(26,34,81,0.4)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6 text-navy" />
        </button>

        {/* Image Carousel */}
        {images.length > 0 && (
          <CarouselImage
            images={images}
            currentIndex={currentImageIndex}
            code={code}
            onPrev={goToPrevImage}
            onNext={goToNextImage}
          />
        )}

        {/* Content */}
        <div className="p-6">
          {/* Price & Title */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-navy mb-1">{priceLabel}</h2>
            <p className="text-sm text-gray-600 mb-2">{address}</p>
            {(locality || district) && (
              <p className="text-xs text-gray-400">
                {locality}
                {district && district !== locality ? `, ${district}` : ""}
              </p>
            )}
          </div>

          {/* Features Grid */}
          {(!!features.totalArea ||
            !!features.rooms ||
            !!features.bathrooms ||
            !!features.garage) && (
            <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-gradient-to-br from-gray-50/80 via-white/60 to-magenta/5 backdrop-blur-sm border border-gray-100">
              {!!features.totalArea && (
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-magenta" />
                  <div>
                    <p className="text-xs text-gray-500">Superficie</p>
                    <p className="text-sm font-semibold text-navy">
                      {features.totalArea} m²
                    </p>
                  </div>
                </div>
              )}
              {!!features.rooms && (
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-magenta" />
                  <div>
                    <p className="text-xs text-gray-500">Ambientes</p>
                    <p className="text-sm font-semibold text-navy">
                      {features.rooms}
                    </p>
                  </div>
                </div>
              )}
              {!!features.bathrooms && (
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-magenta" />
                  <div>
                    <p className="text-xs text-gray-500">Baños</p>
                    <p className="text-sm font-semibold text-navy">
                      {features.bathrooms}
                    </p>
                  </div>
                </div>
              )}
              {!!features.garage && (
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-magenta" />
                  <div>
                    <p className="text-xs text-gray-500">Cocheras</p>
                    <p className="text-sm font-semibold text-navy">
                      {features.garage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 line-clamp-3">
                {property.description}
              </p>
            </div>
          )}

          {/* Contact Buttons */}
          <div className="flex flex-col gap-3">
            <ContactButtons propertyCode={code} size="md" compact={false} />
            <a
              href={`/propiedad/${property.id}`}
              className="block text-center rounded-lg border-2 border-navy px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
            >
              Ver detalle completo →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Carousel del modal · maneja:
 *  - Preload de la imagen adyacente (next/prev) para que el usuario no
 *    vea la foto vieja mientras la nueva se descarga.
 *  - Spinner si la foto actual aún no está cargada.
 *  - Cross-fade entre fotos para que el cambio se sienta menos brusco.
 */
function CarouselImage({
  images,
  currentIndex,
  code,
  onPrev,
  onNext,
}: {
  images: string[];
  currentIndex: number;
  code: string;
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}) {
  const [loadedSet, setLoadedSet] = useState<Set<string>>(new Set());
  const preloadRefs = useRef<HTMLImageElement[]>([]);

  const currentImage = images[currentIndex] || images[0];
  const isLoaded = loadedSet.has(currentImage);

  // Preload adyacentes · cuando cambia el índice, disparamos un Image()
  // para next y prev. El browser cachea, así que cuando el usuario
  // realmente avanza, ya está descargada.
  useEffect(() => {
    const toPreload: string[] = [];
    if (images.length > 1) {
      const next = images[(currentIndex + 1) % images.length];
      const prev = images[(currentIndex - 1 + images.length) % images.length];
      if (next) toPreload.push(next);
      if (prev) toPreload.push(prev);
    }
    if (currentImage) toPreload.push(currentImage);

    preloadRefs.current = [];
    for (const src of toPreload) {
      if (loadedSet.has(src)) continue;
      const img = new Image();
      img.onload = () => {
        setLoadedSet((prev) => {
          if (prev.has(src)) return prev;
          const next = new Set(prev);
          next.add(src);
          return next;
        });
      };
      img.src = src;
      preloadRefs.current.push(img);
    }
  }, [currentIndex, images, currentImage, loadedSet]);

  return (
    <div className="relative bg-gray-100 aspect-video overflow-hidden rounded-t-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={currentImage}
        src={currentImage}
        alt={`Propiedad ${code}`}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() =>
          setLoadedSet((prev) => {
            if (prev.has(currentImage)) return prev;
            const next = new Set(prev);
            next.add(currentImage);
            return next;
          })
        }
      />

      {/* Spinner mientras carga · aparece sobre el placeholder gris */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-8 h-8 text-navy/40 animate-spin" />
        </div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6 text-navy" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6 text-navy" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
