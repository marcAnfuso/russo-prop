import { fetchPublicDevelopments } from "@/lib/xintel-developments";
import EmprendimientosClient from "./EmprendimientosClient";

export default async function EmprendimientosPage() {
  const developments = await fetchPublicDevelopments();
  return <EmprendimientosClient developments={developments} />;
}
