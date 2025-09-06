import PengajuanPageView from "@/app/_components/views/pengajuan";
import { api } from "@/trpc/server";

export default async function PengajuanPage() {
  const dataPengajuan = await api.pengajuan.getPengajuan({
    pageIndex: 0,
    pageSize: 10,
  });
  return (
    <>
      <PengajuanPageView initialData={dataPengajuan} />
    </>
  );
}
