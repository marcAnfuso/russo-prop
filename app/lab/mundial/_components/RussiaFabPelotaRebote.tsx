"use client";

import RussiaFabDemo from "./RussiaFabDemo";

/**
 * Russia con una pelotita rebotando al lado del FAB.
 * Loop infinito, sutil — siempre visible.
 */
export default function RussiaFabPelotaRebote() {
  return (
    <RussiaFabDemo>
      <span
        aria-hidden="true"
        className="pelota-rebote-wrap absolute -right-3 -top-2 pointer-events-none"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" className="pelota-rebote-spin">
          <circle cx="11" cy="11" r="10" fill="white" stroke="#1a2547" strokeWidth="1" />
          <polygon points="11,5 14,7.5 13,11 9,11 8,7.5" fill="#1a2547" />
          <polygon points="3,11 6.5,9.5 8,12 6,15 3.5,14" fill="#1a2547" opacity="0.6" />
          <polygon points="19,11 15.5,9.5 14,12 16,15 18.5,14" fill="#1a2547" opacity="0.6" />
        </svg>
      </span>
      <style jsx>{`
        @keyframes pelota-rebote-y {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pelota-rebote-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        :global(.pelota-rebote-wrap) {
          animation: pelota-rebote-y 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        :global(.pelota-rebote-spin) {
          animation: pelota-rebote-spin 1.4s linear infinite;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.pelota-rebote-wrap), :global(.pelota-rebote-spin) {
            animation: none;
          }
        }
      `}</style>
    </RussiaFabDemo>
  );
}
