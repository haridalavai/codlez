import type { AdapterUser } from "next-auth/adapters";
import * as randomWordSlugs from "random-word-slugs";

import { prisma } from "@repo/db";
import {
  generateRandomUsername,
  generateUsernameFromEmail,
} from "../random-username-generator";

export async function createUser(data: AdapterUser) {
  const { id, name, email, ...rest } = data;

  const newUser = await prisma.user.create({
    data: {
      ...rest,
      id: id,
      name: name || generateRandomUsername(),
      email: email,
    },
  });

  let slug: string | undefined = undefined;

  while (!slug) {
    slug = randomWordSlugs.generateSlug(2);
    const slugAlreadyExists = await prisma.workspace.findFirst({
      where: {
        slug: slug,
      },
    });

    if (slugAlreadyExists) {
      console.log(`slug already exists: '${slug}'`);
      slug = undefined;
    }
  }

  const newWorkspace = await prisma.workspace.create({
    data: {
      slug: slug,
      name: "",
    },
  });

  await prisma.workspaceUser.create({
    data: {
      userId: newUser.id,
      workspaceId: newWorkspace.id,
      role: "owner",
    },
  });

  return newUser;
}

export async function getUser(id: string) {
  const _user = await prisma.user.findUnique({
    where: {
      id: id,
    },

    include: {
      WorkspaceUser: true,
    },
  });

  return _user || null;
}
