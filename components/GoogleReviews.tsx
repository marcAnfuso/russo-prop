"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { reviews, averageRating, totalReviews } from "@/data/reviews";

const avatarColors = ["bg-magenta", "bg-navy", "bg-emerald-600", "bg-amber-500", "bg-violet-600"];

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const s = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`${s} ${i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-100"}`} />
      ))}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { year: "numeric", month: "long" });
}

export default function GoogleReviews() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3 mb-14"
        >
          <div className="flex items-center gap-3">
            <GoogleLogo />
            <span className="text-5xl font-bold tracking-tight text-gray-900">{averageRating}</span>
            <Stars rating={Math.round(averageRating)} size="md" />
          </div>
          <p className="text-sm text-gray-400">{totalReviews} opiniones en Google</p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card p-6 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-semibold flex-shrink-0 ${avatarColors[index % avatarColors.length]}`}>
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                  <Stars rating={review.rating} />
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{review.text}</p>
              <p className="text-xs text-gray-400">{formatDate(review.date)}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="https://g.page/r/russo-propiedades/review"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-magenta text-sm"
          >
            Dejanos tu opinión
          </a>
        </div>
      </div>
    </section>
  );
}
