import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import { prisma } from "@repo/db";
import { createUser, getUser } from "./helpers";

export const adapter: Adapter = {
  ...PrismaAdapter(prisma),
  createUser: async (data: AdapterUser) => {
    return createUser(data);
  },
  getUser: async (id: string) => {
    return getUser(id);
  },
};
