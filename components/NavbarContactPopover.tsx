"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, type LucideIcon } from "lucide-react";

interface NavbarContactPopoverProps {
  icon: LucideIcon;
  label: string;
  value: string;
  displayValue?: string;
  href: string;
  actionLabel: string;
}

export default function NavbarContactPopover({
  icon: Icon,
  label,
  value,
  displayValue,
  href,
  actionLabel,
}: NavbarContactPopoverProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // silent
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={displayValue ?? value}
        aria-label={label}
        aria-expanded={open}
        className="flex items-center p-1.5 rounded-md text-navy hover:text-magenta hover:bg-navy-50 transition-colors"
      >
        <Icon className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-white shadow-[0_20px_50px_-15px_rgba(26,34,81,0.25)] border border-gray-100 p-4 z-50"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-magenta mb-1.5">
            {label}
          </p>
          <p className="text-sm text-navy font-medium break-all leading-snug">
            {displayValue ?? value}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={href}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-magenta text-white text-xs font-semibold py-2 hover:bg-magenta-600 transition-colors"
              onClick={() => setOpen(false)}
            >
              {actionLabel}
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 text-navy text-xs font-semibold py-2 hover:border-magenta hover:text-magenta transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
