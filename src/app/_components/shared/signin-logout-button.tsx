"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { auth, signIn, signOut } from "@/server/auth";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SigninLogoutButton({
  className,
}: {
  className?: string;
}) {
  const isLogin = useSession();
  const session = isLogin.data;

  // console.log("Session in SigninLogoutButton:", session);
  return (
    <>
      {!session ? (
        <Button
          onClick={() => signIn()}
          className={cn(
            "bg-accent text-accent-foreground rounded-full",
            className,
          )}
        >
          Login
        </Button>
      ) : (
        <Button
          onClick={() => signOut()}
          className={cn(
            "bg-accent text-accent-foreground rounded-full",
            className,
          )}
        >
          Logout
        </Button>
      )}
    </>
  );
}
