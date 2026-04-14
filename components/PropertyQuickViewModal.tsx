"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2, Home, Droplets, Car } from "lucide-react";
import type { Property } from "@/data/types";
import ContactButtons from "@/components/ContactButtons";

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

  // Reset image index and lock body scroll when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setCurrentImageIndex(0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

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

  const { code, price, currency, address, locality, district, images, features } = property;
  const currencyLabel = currency === "ARS" ? "$" : "USD";
  const priceLabel =
    price === 9999999
      ? "Reservado"
      : `${currencyLabel} ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
          <div className="relative bg-gray-100 aspect-video overflow-hidden rounded-t-2xl">
            <img
              src={currentImage}
              alt={`Propiedad ${code}`}
              className="w-full h-full object-cover"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6 text-navy" />
                </button>
                <button
                  onClick={goToNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-6 h-6 text-navy" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
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
            <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-200">
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
