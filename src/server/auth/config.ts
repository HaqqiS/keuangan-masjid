import { compare } from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import "next-auth/jwt";

import { db } from "@/server/db";
import { UserRole } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      // ...other properties
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    // ...other properties
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    accessToken?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  // session: { strategy: "jwt", maxAge: 60 * 1 }, // 1 minute
  // session: { strategy: "jwt", maxAge: 60 * 60 }, // 1 hour
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 }, // 1 day
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/auth/login",
  },

  providers: [
    // DiscordProvider,
    Credentials({
      id: "credentials",
      name: "credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        const user = await db.user.findUnique({
          where: { email: email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
          },
        });
        if (!user) {
          return null;
          // throw new Error("User not found");
        }
        const userPassword = user.password;

        if (!userPassword) {
          return null;
          // throw new Error("Password not found");
        }

        const passwordMatches = await compare(password, userPassword);

        // console.log("PASSWORDS MATCH: ", passwordMatches);

        if (passwordMatches) {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }
        return null;
      },
    }),
  ],

  callbacks: {
    // BISA DIGUNAKAN KETIKA MENGGUNAKAN auth as middleware DI middleware.ts
    // authorized({ request, auth }) {
    //   const { pathname } = request.nextUrl;
    //   if (pathname === "/dashboard") return !!auth;
    //   return true;
    // },
    async jwt({ token, trigger, session, account, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.name = user.name ?? "";
        token.email = user.email ?? "";
        token.role = user.role ?? UserRole.PENGURUS;
      }

      // if (trigger === "update") token.name = session.user.name;
      // if (account?.provider === "keycloak") {
      //   return { ...token, accessToken: account.access_token };
      // }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email!;
      session.user.role = token.role;
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
