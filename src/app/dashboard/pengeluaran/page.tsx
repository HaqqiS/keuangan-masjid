import PengeluaranPageView from "@/app/_components/views/pengeluaran";
import { api } from "@/trpc/server";

export default async function PengeluaranPage() {
  const dataPengeluaran = await api.pengeluaran.getPengeluaran();

  return (
    <>
      <PengeluaranPageView initialData={dataPengeluaran} />
    </>
  );
}
