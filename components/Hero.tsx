"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import SearchBar from "@/components/SearchBar";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // On desktop: kick the video programmatically on mount — Safari sometimes
  // ignores the autoplay attribute even on muted videos, and the native
  // play-button fallback gets hidden behind our overlays.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {
      // User's autoplay prefs win — fall back to the still first frame.
    });
  }, []);

  return (
    <section className="relative -mt-[72px] min-h-screen flex items-center justify-center overflow-hidden">
      {/* Mobile: static poster only — video autoplay on iOS is unreliable
          (Low Power Mode, low battery, etc) and a play button on the hero
          feels broken. The jpg loads fast and looks the same. */}
      <Image
        src="/images/hero-poster.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="md:hidden object-cover"
      />

      {/* Desktop: video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        className="hidden md:block absolute inset-0 w-full h-full object-cover"
      >
        <source src="/images/hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay — darker at the top and bottom so the centered
          copy is legible over the busy video, softer in the middle so the
          video still reads as a scene. pointer-events-none so the overlay
          doesn't swallow clicks on Safari's fallback play button. */}
      <div className="absolute inset-0 bg-navy/65 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-transparent to-navy/60 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 w-full max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-magenta mb-4"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
          Zona oeste · desde 1994
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.05] tracking-tight mb-5"
        >
          Tu próximo hogar <span className="italic text-magenta">empieza acá</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="text-base sm:text-lg text-white/85 mb-8 max-w-xl leading-relaxed"
        >
          Inmobiliaria familiar con dos generaciones conociendo cada cuadra
          de zona oeste.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="w-full flex justify-center"
        >
          <SearchBar variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
