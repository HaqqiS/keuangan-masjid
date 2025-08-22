// export { auth as middleware } from "@/server/auth/index";
import { auth } from "@/server/auth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "node_modules/next-auth/lib";
import { navMain } from "./constants/nav-menu.constant";

// Or like this if you need to do something here.
// export default auth((req: NextAuthRequest) => {
//   //  { session: { user: { ... } } }
//   const session = req.auth;
//   const pathname = req.nextUrl.pathname;

//   // console.log("Middleware pathname:", pathname);

//   if (!session) {
//     if (pathname.startsWith("/dashboard")) {
//       const url = new URL("/auth/login", req.nextUrl);
//       url.searchParams.set("callbackUrl", encodeURI(req.url));
//       return NextResponse.redirect(url);
//     }
//   }

//   if (session) {
//     if (pathname === "/auth/login") {
//       return NextResponse.redirect(new URL("/dashboard", req.url));
//     }
//     if (
//       pathname.endsWith("/dashboard") &&
//       session.user.role !== UserRole.KETUA &&
//       session.user.role !== UserRole.BENDAHARA
//     ) {
//       return NextResponse.redirect(new URL("/dashboard/pengajuan", req.url));
//     }

//     if (
//       pathname.startsWith("/dashboard/pemasukan") &&
//       session.user.role !== UserRole.KETUA &&
//       session.user.role !== UserRole.BENDAHARA
//     ) {
//       return NextResponse.redirect(new URL("/dashboard/pengajuan", req.url));
//     }
//     if (
//       pathname.startsWith("/dashboard/pengeluaran") &&
//       session.user.role !== UserRole.KETUA &&
//       session.user.role !== UserRole.BENDAHARA
//     ) {
//       return NextResponse.redirect(new URL("/dashboard/pengajuan", req.url));
//     }
//   }
// });

export default auth((req: NextAuthRequest) => {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;

  // 1. Logika untuk pengguna yang BELUM LOGIN (Ini sudah benar)
  if (!session && pathname.startsWith("/dashboard")) {
    const url = new URL("/auth/login", req.nextUrl);
    url.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(url);
  }

  // Jika sudah login, lanjutkan ke pengecekan peran
  if (session) {
    // Redirect dari halaman login jika sudah login (Ini sudah benar)
    if (pathname === "/auth/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // --- LOGIKA PERLINDUNGAN PERAN DINAMIS ---
    // 1. Salin dan urutkan navMain dari URL terpanjang ke terpendek.
    //    Ini memastikan "/dashboard/pengajuan" akan dicek SEBELUM "/dashboard".
    const sortedNavMain = [...navMain].sort(
      (a, b) => b.url.length - a.url.length,
    );

    // 2. Cari aturan navigasi menggunakan daftar yang sudah diurutkan
    const requestedNav = sortedNavMain.find((nav) =>
      pathname.startsWith(nav.url),
    );

    // 3. Sisa logika tidak perlu diubah, karena sekarang akan menemukan aturan yang benar
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (requestedNav && requestedNav.roles) {
      const userRole = session.user.role;
      const userHasPermission = requestedNav.roles.includes(userRole);

      if (!userHasPermission) {
        return NextResponse.redirect(new URL("/dashboard/pengajuan", req.url));
      }
    }
  }

  // Jika semua pengecekan lolos, izinkan akses
  return NextResponse.next();
});

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    // "/dashboard/:path*",
  ],
};
