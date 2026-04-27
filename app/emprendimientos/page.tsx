import { fetchDevelopments } from "@/lib/xintel-developments";
import EmprendimientosClient from "./EmprendimientosClient";

export default async function EmprendimientosPage() {
  const developments = await fetchDevelopments();
  return <EmprendimientosClient developments={developments} />;
}
