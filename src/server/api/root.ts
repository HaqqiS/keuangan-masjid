import { postRouter } from "@/server/api/routers/post.router";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { kategoriRouter } from "./routers/kategori.router";
import { pemasukanRouter } from "./routers/pemasukan.router";
import { pengeluaranRouter } from "./routers/pengeluaran.router";
import { pengajuanRouter } from "./routers/pengajuan.router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  kategori: kategoriRouter,
  pemasukan: pemasukanRouter,
  pengeluaran: pengeluaranRouter,
  pengajuan: pengajuanRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
