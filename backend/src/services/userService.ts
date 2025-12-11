import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createUser = async (username: string, passwordHash: string) => {
  return await prisma.user.create({
    data: {
      username,
      password: passwordHash,
      stats: {
        create: {
          wins: 0,
          losses: 0,
        },
      },
    },
  });
};

export const findUser = async (username: string) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};

export const incrementWin = async (username: string) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;

  return await prisma.stats.update({
    where: { userId: user.id },
    data: { wins: { increment: 1 } },
  });
};

export const incrementLoss = async (username: string) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;

  return await prisma.stats.update({
    where: { userId: user.id },
    data: { losses: { increment: 1 } },
  });
};

export const getStats = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { stats: true },
  });
  if (!user || !user.stats) return { wins: 0, losses: 0 };
  return { wins: user.stats.wins, losses: user.stats.losses };
};
