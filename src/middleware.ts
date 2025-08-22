// export { auth as middleware } from "@/server/auth/index";
import { auth } from "@/server/auth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "node_modules/next-auth/lib";

// Or like this if you need to do something here.
export default auth((req: NextAuthRequest) => {
  //  { session: { user: { ... } } }
  const session = req.auth;
  const pathname = req.nextUrl.pathname;

  // console.log("Middleware pathname:", pathname);

  if (!session) {
    if (pathname.startsWith("/dashboard")) {
      const url = new URL("/auth/login", req.nextUrl);
      url.searchParams.set("callbackUrl", encodeURI(req.url));
      return NextResponse.redirect(url);
    }
  }

  if (session) {
    if (pathname === "/auth/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (
      pathname.endsWith("/dashboard") &&
      (session.user.role === UserRole.KETUA || UserRole.BENDAHARA)
    ) {
      return NextResponse.redirect(new URL("/dashboard/pengajuan", req.url));
    }

    if (
      pathname.startsWith("/dashboard/pemasukan") &&
      (session.user.role === UserRole.KETUA || UserRole.BENDAHARA)
    ) {
      return NextResponse.redirect(new URL("/dashboard/pengajuan", req.url));
    }
    if (
      pathname.startsWith("/dashboard/pengeluaran") &&
      (session.user.role === UserRole.KETUA || UserRole.BENDAHARA)
    ) {
      return NextResponse.redirect(new URL("/dashboard/pengajuan", req.url));
    }
  }
});

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    // "/dashboard/:path*",
  ],
};
