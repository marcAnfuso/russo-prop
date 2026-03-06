import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            {isLast || !item.href ? (
              <span className="text-gray-500">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-navy hover:text-magenta transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
