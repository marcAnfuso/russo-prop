import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { deactivateByToken } from "@/lib/alerts-db";

export const metadata: Metadata = {
  title: "Darse de baja",
  description: "Cancelar alertas de propiedades",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const ok = token ? await deactivateByToken(token) : false;

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        {ok ? (
          <>
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-navy mb-2">
              Te dimos de baja
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              No vas a recibir más emails de alertas. Si fue por error,
              podés crear una nueva en cualquier momento desde nuestro sitio.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto h-14 w-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-semibold text-navy mb-2">
              Link inválido
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              El link de baja no es válido o la alerta ya estaba desactivada.
              Si seguís recibiendo emails, escribinos y lo solucionamos.
            </p>
          </>
        )}
        <Link
          href="/"
          className="inline-block rounded-full border-2 border-magenta px-5 py-2 text-sm font-semibold text-magenta hover:bg-magenta hover:text-white transition-colors"
        >
          Volver al sitio
        </Link>
      </div>
    </main>
  );
}
