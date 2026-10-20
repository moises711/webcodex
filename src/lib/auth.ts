import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hashSync } from "bcryptjs";
import { z } from "zod";
import { db } from "./db";
import { clientAddress } from "./request-security";
import {
  consumeRequestLimit,
  consumeLoginAttempt,
  resetLoginAttempts,
} from "./rate-limit";
const dummyHash = hashSync("unusable-dummy-password", 12);
const loginSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1).max(128),
});
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/ingresar" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const ip = clientAddress(request.headers);
        if (!(await consumeRequestLimit("login-ip", ip, 50, 900))) return null;
        if (!(await consumeLoginAttempt(email, ip))) return null;
        const user = await db.user.findUnique({ where: { email } });
        const valid = await compare(password, user?.passwordHash || dummyHash);
        if (!user || !valid || !user.isActive) return null;
        await resetLoginAttempts(email, ip);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.sessionVersion = Number(token.sessionVersion);
      }
      return session;
    },
  },
});
