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
      {/* PREVIEW: foto nueva de Russo */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-russo-color.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/65" />
      </div>

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
