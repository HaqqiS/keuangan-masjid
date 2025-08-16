import { api } from "@/trpc/server";
import KategoriClientPage from "../../_components/views/kategori";

export default async function KategoriPage() {
  const initialKategoris = await api.kategori.getKategori({
    type: "ALL",
  });
  return (
    <>
      <KategoriClientPage initialKategoris={initialKategoris} />
    </>
  );
}
