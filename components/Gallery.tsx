"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Camera, Play, FileImage, Download, ZoomIn, ZoomOut, Orbit } from "lucide-react";
import { toEmbedUrl } from "@/lib/utils";

interface GalleryProps {
  images: string[];
  videoUrl?: string;
  plans?: string[];
  tour360Url?: string;
  title: string;
}

type Tab = "fotos" | "video" | "planos" | "tour360";

export default function Gallery({ images, videoUrl, plans, tour360Url, title }: GalleryProps) {
  const [activeTab, setActiveTab] = useState<Tab>("fotos");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [openPlanIdx, setOpenPlanIdx] = useState<number | null>(null);
  const [planZoom, setPlanZoom] = useState(1);
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

  // Escape closes the plan viewer
  useEffect(() => {
    if (openPlanIdx === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPlanIdx(null);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [openPlanIdx]);

  // Lock body scroll while plan modal is open — sin esto la página de
  // atrás se puede desplazar con la rueda del mouse.
  useEffect(() => {
    if (openPlanIdx === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openPlanIdx]);

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
  // Only include Video tab when the property actually has a video.
  // Map was removed — the property map is already shown in its own section below.

  const hasPlans = !!plans && plans.length > 0;
  const hasTour = !!tour360Url;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "fotos", label: "Fotos", icon: <Camera className="w-4 h-4" /> },
    ...(videoUrl
      ? [{ key: "video" as Tab, label: "Video", icon: <Play className="w-4 h-4" /> }]
      : []),
    ...(hasTour
      ? [{ key: "tour360" as Tab, label: "Tour 360°", icon: <Orbit className="w-4 h-4" /> }]
      : []),
    ...(hasPlans
      ? [{ key: "planos" as Tab, label: "Planos", icon: <FileImage className="w-4 h-4" /> }]
      : []),
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
            src={toEmbedUrl(videoUrl)}
            title={`${title} - video`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return null;
  };

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
              className={`flex items-center gap-1.5 pb-2 text-sm font-medium transition-colors border-b-2 -mb-px rounded-t-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta/40 focus-visible:ring-offset-2 ${
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

        {activeTab === "tour360" && hasTour && (
          <div className="space-y-3">
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              <iframe
                src={tour360Url}
                title={`${title} - tour virtual 360°`}
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <a
              href={tour360Url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-magenta hover:underline"
            >
              <Orbit className="h-3.5 w-3.5" />
              Abrir en pantalla completa
            </a>
          </div>
        )}

        {activeTab === "planos" && hasPlans && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans!.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setOpenPlanIdx(i);
                  setPlanZoom(1);
                }}
                className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 border border-gray-200 hover:border-magenta transition-colors cursor-zoom-in"
                aria-label={`Ver plano ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`${title} · plano ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-2 bg-white"
                />
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-navy opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-3 w-3" />
                  Ampliar
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Plan viewer modal */}
      {openPlanIdx !== null && hasPlans && (
        <div
          role="dialog"
          aria-label={`Plano ${openPlanIdx + 1}`}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setOpenPlanIdx(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpenPlanIdx(null);
          }}
          tabIndex={-1}
        >
          {/* Top toolbar — contenedor oscuro para que los controles se
              vean siempre, aunque el plano tenga zonas blancas detrás. */}
          <div
            className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-navy/90 backdrop-blur-md p-1 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() =>
                setPlanZoom((z) => Math.max(1, Math.round((z - 0.5) * 10) / 10))
              }
              aria-label="Alejar"
              disabled={planZoom <= 1}
              className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-white/15 text-white disabled:opacity-40 transition"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPlanZoom((z) => Math.min(4, z + 0.5))}
              aria-label="Acercar"
              disabled={planZoom >= 4}
              className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-white/15 text-white disabled:opacity-40 transition"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <a
              href={plans![openPlanIdx]}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-magenta text-white font-semibold px-3.5 h-9 text-sm hover:bg-magenta-600 transition-colors ml-1"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </a>
            <button
              type="button"
              onClick={() => setOpenPlanIdx(null)}
              aria-label="Cerrar"
              className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-white/15 text-white transition ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Plan image */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={plans![openPlanIdx]}
              alt={`${title} · plano ${openPlanIdx + 1}`}
              style={{
                transform: `scale(${planZoom})`,
                transition: "transform 0.2s ease-out",
                transformOrigin: "center center",
              }}
              className="max-w-full max-h-full select-none bg-white rounded-md shadow-2xl"
              draggable={false}
            />
          </div>

          {/* Zoom indicator */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 text-white text-xs px-3 py-1.5 backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            {Math.round(planZoom * 100)}%
          </div>

          {/* Navigation between plans, if more than one */}
          {plans!.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPlanIdx((i) => ((i ?? 0) - 1 + plans!.length) % plans!.length);
                  setPlanZoom(1);
                }}
                aria-label="Plano anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPlanIdx((i) => ((i ?? 0) + 1) % plans!.length);
                  setPlanZoom(1);
                }}
                aria-label="Plano siguiente"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}

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
