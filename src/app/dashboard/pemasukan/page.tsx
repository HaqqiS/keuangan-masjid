import { api } from "@/trpc/server";
import { PemasukanViewPage } from "../../_components/views/pemasukan";

export default async function PemasukanPage() {
  const dataPemasukan = await api.pemasukan.getPemasukan({
    pageIndex: 0,
    pageSize: 10,
  });

  return <PemasukanViewPage initialData={dataPemasukan} />;
}
