import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import Postmark from "next-auth/providers/postmark";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Prisma, prisma } from "@repo/db";
import {
  generateRandomUsername,
  generateUsernameFromEmail,
} from "../random-username-generator";
import { adapter } from "./adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: adapter,
  providers: [
    Google,
    Github,
    Resend({
      from: "no-reply@xcopilot.co",
    }),
  ],
  callbacks: {
    async signIn(params) {
      console.log("signIn", params);
      if (params?.account?.provider === "resend") {
        if (!params.profile) return true;
        if (Number.isNaN(Number(params.user.id))) return true;

        await prisma.user.update({
          where: {
            id: params.user.id,
          },
          data: {
            name: params.profile.email
              ? generateUsernameFromEmail(params.profile.email)
              : generateRandomUsername(),
          },
        });
      }
      return true;
    },
    session: async ({ token, session }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        include: {
          WorkspaceUser: {
            include: {
              workspace: true,
            },
          },
        },
      });
      console.log("session", user);
      return session;
    },
    jwt: async (params) => {
      console.log("jwt", params);
      return params;
    },
  },
});
