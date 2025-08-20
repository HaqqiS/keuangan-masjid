import PengajuanPageView from "@/app/_components/views/pengajuan";
import { api } from "@/trpc/server";

export default async function PengajuanPage() {
  const dataPengajuan = await api.pengajuan.getPengajuan();
  return (
    <>
      <PengajuanPageView initialData={dataPengajuan} />
    </>
  );
}
