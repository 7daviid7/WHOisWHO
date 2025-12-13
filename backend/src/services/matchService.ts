import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateMatchLogData {
    userId: number;
    opponentName: string;
    result: 'WIN' | 'LOSS' | 'DRAW';
    turns: number;
    mode: string;
}

export const logMatch = async (data: CreateMatchLogData) => {
    try {
        const log = await prisma.matchLog.create({
            data: {
                userId: data.userId,
                opponentName: data.opponentName,
                result: data.result,
                turns: data.turns,
                mode: data.mode
            }
        });
        return log;
    } catch (error) {
        console.error('Error logging match:', error);
        throw error;
    }
};

export const getMatchHistory = async (username: string, page: number = 1, limit: number = 10) => {
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) throw new Error('User not found');

        const skip = (page - 1) * limit;

        const [matches, total] = await prisma.$transaction([
            prisma.matchLog.findMany({
                where: { userId: user.id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.matchLog.count({ where: { userId: user.id } })
        ]);

        return {
            matches,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error fetching match history:', error);
        throw error;
    }
};
