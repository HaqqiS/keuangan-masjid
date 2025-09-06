import PengeluaranPageView from "@/app/_components/views/pengeluaran";
import { api } from "@/trpc/server";

export default async function PengeluaranPage() {
  const dataPengeluaran = await api.pengeluaran.getPengeluaran({
    pageIndex: 0,
    pageSize: 10,
  });

  return (
    <>
      <PengeluaranPageView initialData={dataPengeluaran} />
    </>
  );
}
