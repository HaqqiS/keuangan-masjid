import Link from "next/link";

import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  // console.log("Session in Home:", session);

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1f1f1f] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Sistem <span className="text-slate-600">Keuangan</span> Masjid
          </h1>

          {/* {session?.user && <LatestPost />} */}

          <Link
            href={session ? "/api/auth/signout" : "/auth/login"}
            className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
          {session && (
            <Link
              href="/dashboard"
              className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20 hover:underline"
            >
              Dashboard
            </Link>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
