"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { reviews, averageRating, totalReviews } from "@/data/reviews";

interface GoogleReviewsProps {
  className?: string;
}

const avatarColors = [
  "bg-magenta",
  "bg-navy",
  "bg-emerald-600",
  "bg-amber-500",
  "bg-violet-600",
];

function StarRating({
  rating,
  label,
}: {
  rating: number;
  label: string;
}) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-magenta text-magenta"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function HeaderStars() {
  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`Rating: ${averageRating} de 5 estrellas`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const isFull = i < Math.floor(averageRating);
        const isPartial =
          !isFull && i < Math.ceil(averageRating) && averageRating % 1 > 0;

        if (isPartial) {
          const percent = Math.round((averageRating % 1) * 100);
          return (
            <span key={i} className="relative inline-block w-5 h-5">
              <Star className="absolute inset-0 w-5 h-5 fill-gray-200 text-gray-200" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${percent}%` }}
              >
                <Star className="w-5 h-5 fill-magenta text-magenta" />
              </span>
            </span>
          );
        }

        return (
          <Star
            key={i}
            className={`w-5 h-5 ${
              isFull
                ? "fill-magenta text-magenta"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        );
      })}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function GoogleReviews({ className = "" }: GoogleReviewsProps) {
  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center mb-12">
          <div className="flex items-center gap-3">
            <GoogleLogo />
            <span className="text-4xl font-bold text-gray-900">
              {averageRating}
            </span>
            <HeaderStars />
          </div>
          <p className="text-gray-500 text-sm">
            {totalReviews} opiniones en Google
          </p>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-lg bg-white p-6 shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-semibold ${
                    avatarColors[index % avatarColors.length]
                  }`}
                >
                  {review.name.charAt(0)}
                </div>
                <span className="font-bold text-gray-900">{review.name}</span>
              </div>

              <StarRating
                rating={review.rating}
                label={`Rating: ${review.rating} de 5 estrellas`}
              />

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {review.text}
              </p>

              <p className="mt-3 text-xs text-gray-400">
                {formatDate(review.date)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <a
            href="https://g.page/r/russo-propiedades/review"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-magenta px-6 py-2.5 text-sm font-semibold text-magenta transition-colors hover:bg-magenta hover:text-white"
          >
            Dejanos tu opinion
          </a>
        </div>
      </div>
    </section>
  );
}
