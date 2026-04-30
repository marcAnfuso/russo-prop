import { fetchPublicDevelopments } from "@/lib/xintel-developments";
import EmprendimientosClient from "./EmprendimientosClient";

// Render dinámico · evita timeout de Xintel durante el build.
export const dynamic = "force-dynamic";

export default async function EmprendimientosPage() {
  const developments = await fetchPublicDevelopments();
  return <EmprendimientosClient developments={developments} />;
}
