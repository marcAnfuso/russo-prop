"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  Play,
  Map,
} from "lucide-react";

interface GalleryProps {
  images: string[];
  videoUrl?: string;
  title: string;
}

type Tab = "fotos" | "video" | "mapa";

export default function Gallery({ images, videoUrl, title }: GalleryProps) {
  const [activeTab, setActiveTab] = useState<Tab>("fotos");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const hasImages = images.length > 0;

  // ---------- Navigation helpers ----------

  const goTo = useCallback(
    (index: number) => {
      if (!hasImages) return;
      setCurrentIndex((index + images.length) % images.length);
    },
    [hasImages, images.length],
  );

  const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);
  const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);

  // ---------- Lightbox ----------

  const openLightbox = (index?: number) => {
    if (!hasImages) return;
    if (index !== undefined) setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightboxOpen, closeLightbox, goPrev, goNext]);

  // Focus trap: focus the lightbox container when it opens
  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      lightboxRef.current.focus();
    }
  }, [lightboxOpen]);

  // Preload adjacent images
  useEffect(() => {
    if (!hasImages) return;
    const preload = (idx: number) => {
      const i = (idx + images.length) % images.length;
      const img = new window.Image();
      img.src = images[i];
    };
    preload(currentIndex + 1);
    preload(currentIndex - 1);
  }, [currentIndex, hasImages, images]);

  // ---------- Tabs ----------

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "fotos", label: "Fotos", icon: <Camera className="w-4 h-4" /> },
    { key: "video", label: "Video", icon: <Play className="w-4 h-4" /> },
    { key: "mapa", label: "Mapa", icon: <Map className="w-4 h-4" /> },
  ];

  // ---------- Render helpers ----------

  const renderPlaceholder = () => (
    <div className="flex items-center justify-center w-full aspect-video bg-gradient-to-br from-navy-200 to-navy-400 rounded-lg">
      <span className="text-white/80 text-lg font-medium">Sin imágenes</span>
    </div>
  );

  const renderMainImage = () => {
    if (!hasImages) return renderPlaceholder();

    return (
      <div
        className="relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer group/main"
        onClick={() => openLightbox()}
      >
        <Image
          src={images[currentIndex]}
          alt={`${title} - imagen ${currentIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 75vw"
          className="object-cover"
          priority={currentIndex === 0}
        />

        {/* Prev / Next arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Imagen anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover/main:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Imagen siguiente"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover/main:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Counter badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          <Camera className="w-3.5 h-3.5" />
          <span>
            {currentIndex + 1}/{images.length}
          </span>
        </div>
      </div>
    );
  };

  const thumbnailButtons = images.map((src, idx) => (
    <button
      key={idx}
      onClick={() => goTo(idx)}
      aria-label={`Ver imagen ${idx + 1}`}
      className={`relative flex-shrink-0 w-20 h-16 md:w-full md:h-auto md:aspect-video rounded-md overflow-hidden border-2 transition-all duration-200 group/thumb ${
        idx === currentIndex
          ? "border-magenta"
          : "border-transparent hover:border-magenta-300"
      }`}
    >
      <Image
        src={src}
        alt={`${title} - miniatura ${idx + 1}`}
        fill
        sizes="(max-width: 768px) 80px, 20vw"
        className="object-cover transition-transform duration-300 group-hover/thumb:scale-105"
      />
    </button>
  ));

  const renderThumbnails = () => {
    if (!hasImages) return null;
    // Mobile-only: horizontal scrolling strip
    return (
      <div className="flex flex-row gap-2 overflow-x-auto">
        {thumbnailButtons}
      </div>
    );
  };

  const renderVideoTab = () => {
    if (videoUrl) {
      return (
        <div className="w-full aspect-video rounded-lg overflow-hidden">
          <iframe
            src={videoUrl}
            title={`${title} - video`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center w-full aspect-video bg-gray-100 rounded-lg">
        <Play className="w-12 h-12 text-gray-400 mb-2" />
        <span className="text-gray-500 text-sm">Video no disponible</span>
      </div>
    );
  };

  const renderMapTab = () => (
    <div className="flex flex-col items-center justify-center w-full aspect-video bg-gray-100 rounded-lg">
      <Map className="w-12 h-12 text-gray-400 mb-2" />
      <span className="text-gray-500 text-sm">
        Mapa disponible más abajo en la página
      </span>
    </div>
  );

  // ---------- Main render ----------

  return (
    <>
      <div className="w-full">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-magenta text-magenta"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "fotos" && (
          <>
            {/* Desktop: asymmetric grid (lg+) */}
            <div className="hidden lg:block">
              {!hasImages && renderPlaceholder()}
              {images.length === 1 && (
                <div
                  className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(0)}
                >
                  <Image
                    src={images[0]}
                    alt={`${title} - imagen 1`}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              {images.length === 2 && (
                <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden aspect-[16/9]">
                  {images.slice(0, 2).map((src, idx) => (
                    <div
                      key={idx}
                      className="relative cursor-pointer"
                      onClick={() => openLightbox(idx)}
                    >
                      <Image
                        src={src}
                        alt={`${title} - imagen ${idx + 1}`}
                        fill
                        sizes="50vw"
                        className="object-cover"
                        priority={idx === 0}
                      />
                    </div>
                  ))}
                </div>
              )}
              {images.length >= 3 && (
                <div className="grid grid-cols-3 grid-rows-2 gap-2 rounded-2xl overflow-hidden aspect-[16/9]">
                  {/* Main image - spans 2 cols and full height */}
                  <div
                    className="col-span-2 row-span-2 relative cursor-pointer"
                    onClick={() => openLightbox(0)}
                  >
                    <Image
                      src={images[0]}
                      alt={`${title} - imagen 1`}
                      fill
                      sizes="66vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                  {/* Second image */}
                  <div
                    className="relative cursor-pointer"
                    onClick={() => openLightbox(1)}
                  >
                    <Image
                      src={images[1]}
                      alt={`${title} - imagen 2`}
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                  </div>
                  {/* Third image with "+N" overlay if more images exist */}
                  <div
                    className="relative cursor-pointer"
                    onClick={() => openLightbox(2)}
                  >
                    <Image
                      src={images[2]}
                      alt={`${title} - imagen 3`}
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                    {images.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          +{images.length - 3} fotos
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile: main image with carousel + "Ver fotos" button */}
            <div className="lg:hidden">
              <div className="flex flex-col gap-3">
                <div>{renderMainImage()}</div>
                <div>{renderThumbnails()}</div>
              </div>
            </div>
          </>
        )}

        {activeTab === "video" && renderVideoTab()}
        {activeTab === "mapa" && renderMapTab()}
      </div>

      {/* Lightbox */}
      {lightboxOpen && hasImages && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-label={`Galería de imágenes - ${title}`}
          aria-modal="true"
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 outline-none"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            aria-label="Cerrar galería"
            className="absolute top-4 right-4 text-white hover:text-magenta-300 transition-colors z-10"
          >
            <X className="w-7 h-7" />
          </button>

          {/* Prev arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Imagen anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors z-10"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* Image */}
          <div
            className="relative w-full max-w-5xl mx-8 aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex]}
              alt={`${title} - imagen ${currentIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Next arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Imagen siguiente"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors z-10"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 text-white text-sm font-medium px-3 py-1.5 rounded-full">
            <Camera className="w-4 h-4" />
            <span>
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
