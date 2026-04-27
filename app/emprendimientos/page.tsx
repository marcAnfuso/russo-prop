import { listDevelopments } from "@/lib/developments-db";
import EmprendimientosClient from "./EmprendimientosClient";

export default async function EmprendimientosPage() {
  const developments = await listDevelopments();
  return <EmprendimientosClient developments={developments} />;
}
