import { StatusPengajuan } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// Fungsi helper untuk menghitung persentase perubahan
const calculatePercentageChange = (
  current: number,
  previous: number,
): number => {
  if (previous === 0) {
    // Jika nilai sebelumnya 0 dan nilai sekarang positif, anggap kenaikan 100%
    return current > 0 ? 100 : 0;
  }
  const change = ((current - previous) / previous) * 100;
  return parseFloat(change.toFixed(1)); // Dibulatkan 1 angka di belakang koma
};

export const dashboardRouter = createTRPCRouter({
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    // Bulan ini
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    // Bulan lalu
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const { db } = ctx;

    //SALDO
    const totalPemasukanQuery = db.pemasukan.aggregate({
      _sum: { jumlah: true },
    });
    const totalPengeluaranQuery = db.pengeluaran.aggregate({
      _sum: { jumlah: true },
    });

    // PENGAJUAN
    const pengajuanBulanIniStatusQuery = db.pengajuan.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { createdAt: { gte: startOfMonth, lt: startOfNextMonth } },
    });
    const pengajuanBulanLaluQuery = db.pengajuan.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
    });

    // PEMASUKAN
    const pemasukanBulanIniQuery = db.pemasukan.aggregate({
      _sum: { jumlah: true },
      where: { createdAt: { gte: startOfMonth, lt: startOfNextMonth } },
    });
    const pemasukanBulanLaluQuery = db.pemasukan.aggregate({
      _sum: { jumlah: true },
      where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
    });
    const topPemasukanCategoryQuery = db.pemasukan.groupBy({
      by: ["kategoriId"],
      _sum: { jumlah: true },
      where: { createdAt: { gte: startOfMonth, lt: startOfNextMonth } },
      orderBy: { _sum: { jumlah: "desc" } }, // Urutkan dari jumlah terbesar
      take: 1, // Ambil 1 teratas
    });

    // PENGELUARAN
    const pengeluaranBulanIniQuery = db.pengeluaran.aggregate({
      _sum: { jumlah: true },
      where: {
        pengajuan: { status: StatusPengajuan.APPROVED },
        createdAt: { gte: startOfMonth, lt: startOfNextMonth },
      },
    });
    const pengeluaranBulanLaluQuery = db.pengeluaran.aggregate({
      _sum: { jumlah: true },
      where: {
        pengajuan: { status: StatusPengajuan.APPROVED },
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
    });
    const topPengeluaranCategoryQuery = db.pengeluaran.groupBy({
      by: ["kategoriId"],
      _sum: { jumlah: true },
      where: {
        pengajuan: { status: StatusPengajuan.APPROVED },
        createdAt: { gte: startOfMonth, lt: startOfNextMonth },
      },
      orderBy: { _sum: { jumlah: "desc" } },
      take: 1,
    });

    const [
      totalPemasukanData,
      totalPengeluaranData,
      pengajuanBulanIniStatusData,
      pengajuanBulanLaluData,
      pemasukanBulanIniData,
      pemasukanBulanLaluData,
      topPemasukanCategoryData,
      pengeluaranBulanIniData,
      pengeluaranBulanLaluData,
      topPengeluaranCategoryData,
    ] = await Promise.all([
      totalPemasukanQuery,
      totalPengeluaranQuery,
      pengajuanBulanIniStatusQuery,
      pengajuanBulanLaluQuery,
      pemasukanBulanIniQuery,
      pemasukanBulanLaluQuery,
      topPemasukanCategoryQuery,
      pengeluaranBulanIniQuery,
      pengeluaranBulanLaluQuery,
      topPengeluaranCategoryQuery,
    ]);

    // 3. Ambil hasil dan format data
    const totalPemasukan = totalPemasukanData._sum.jumlah ?? 0;
    const totalPengeluaran = totalPengeluaranData._sum.jumlah ?? 0;
    const saldoAkhir = Number(totalPemasukan) - Number(totalPengeluaran);

    // PEMASUKAN
    const pemasukanBulanIni = Number(pemasukanBulanIniData._sum.jumlah ?? 0);
    const pemasukanBulanLalu = Number(pemasukanBulanLaluData._sum.jumlah ?? 0);
    const pemasukanChange = calculatePercentageChange(
      pemasukanBulanIni,
      pemasukanBulanLalu,
    );

    let topCategoryInfo = null;
    const topCategoryResult = topPemasukanCategoryData[0];

    // Jika ada pemasukan bulan ini, cari nama kategorinya
    if (topCategoryResult) {
      const kategori = await db.kategori.findUnique({
        where: { id: topCategoryResult.kategoriId },
        select: { name: true },
      });
      if (kategori) {
        topCategoryInfo = {
          name: kategori.name,
          amount: Number(topCategoryResult._sum.jumlah ?? 0),
        };
      }
    }

    //PENGELUARAN
    const pengeluaranBulanIni = Number(
      pengeluaranBulanIniData._sum.jumlah ?? 0,
    );
    const pengeluaranBulanLalu = Number(
      pengeluaranBulanLaluData._sum.jumlah ?? 0,
    );
    const pengeluaranChange = calculatePercentageChange(
      pengeluaranBulanIni,
      pengeluaranBulanLalu,
    );

    let topPengeluaranCategoryInfo = null;
    const topPengeluaranResult = topPengeluaranCategoryData[0];

    if (topPengeluaranResult) {
      const kategori = await db.kategori.findUnique({
        where: { id: topPengeluaranResult.kategoriId },
        select: { name: true },
      });
      if (kategori) {
        topPengeluaranCategoryInfo = {
          name: kategori.name,
          amount: Number(topPengeluaranResult._sum.jumlah ?? 0),
        };
      }
    }

    // SALDO
    const netIncomeBulanIni = pemasukanBulanIni - pengeluaranBulanIni;
    const netIncomeBulanLalu = pemasukanBulanLalu - pengeluaranBulanLalu;
    const perbedaanNetIncome = netIncomeBulanIni - netIncomeBulanLalu;
    const saldoChange = calculatePercentageChange(
      netIncomeBulanIni,
      netIncomeBulanLalu,
    );

    // PENGAJUAN
    const statusCounts = {
      APPROVED: 0,
      REJECTED: 0,
      PENDING: 0,
    };
    pengajuanBulanIniStatusData.forEach((item) => {
      statusCounts[item.status] = item._count.status;
    });
    const totalPengajuanBulanIni =
      statusCounts.APPROVED + statusCounts.REJECTED + statusCounts.PENDING;
    const totalPengajuanBulanLalu = pengajuanBulanLaluData;
    const pengajuanChange = calculatePercentageChange(
      totalPengajuanBulanIni,
      totalPengajuanBulanLalu,
    );

    return {
      saldoAkhir,
      pengeluaranBulanIni,

      saldo: {
        netIncomeBulanIni,
        perbedaanNetIncome,
        saldoChange,
      },
      pengajuan: {
        totalPengajuanBulanIni,
        statusCounts,
        pengajuanChange,
      },
      pemasukan: {
        pemasukanBulanIni,
        pemasukanChange,
        topCategoryInfo, // Kirim info kategori terbesar
      },

      pengeluaran: {
        pengeluaranBulanIni,
        pengeluaranChange,
        topPengeluaranCategoryInfo, // Kirim info kategori terbesar
      },
    };
  }),
});
