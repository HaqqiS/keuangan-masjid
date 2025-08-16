// "use client";

import { api } from "@/trpc/server";
import { PemasukanViewPage } from "../../_components/views/pemasukan";

export default async function PemasukanPage() {
  const dataPemasukan = await api.pemasukan.getPemasukan();

  return <PemasukanViewPage initialData={dataPemasukan} />;
}
