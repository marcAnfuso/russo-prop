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
    <section className="relative -mt-[72px] min-h-[68vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Mobile: foto de San Justo (plaza central) con overlay pesado.
          Da contexto visual sin dar vueltas — este es el territorio de
          Russo. */}
      <div className="md:hidden absolute inset-0">
        <Image
          src="/images/neighborhoods/san-justo.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(230,0,126,0.2),transparent_60%)]" />
      </div>

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

      {/* Gradient overlay — solo desktop, para oscurecer el video. */}
      <div className="hidden md:block absolute inset-0 bg-navy/65 pointer-events-none" />
      <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-navy/40 via-transparent to-navy/60 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 w-full max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.05] tracking-tight mb-10"
        >
          Tu próximo hogar
          <br />
          <span className="italic text-magenta">empieza acá</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="w-full flex justify-center"
        >
          <SearchBar variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
