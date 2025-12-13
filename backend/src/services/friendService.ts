import { PrismaClient, FriendshipStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Search users by username (excluding self)
export async function searchUsers(query: string, currentUserId: number, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: query,
        mode: 'insensitive',
      },
      NOT: {
        id: currentUserId,
      },
    },
    select: {
      id: true,
      username: true,
    },
    skip,
    take: limit,
  });

  const total = await prisma.user.count({
    where: {
      username: {
        contains: query,
        mode: 'insensitive',
      },
      NOT: {
        id: currentUserId,
      },
    },
  });

  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

// Send Friend Request
export async function sendFriendRequest(fromUserId: number, toUserId: number) {
  // Check if request already exists
  const existing = await prisma.userFriend.findFirst({
    where: {
      OR: [
        { userId: fromUserId, friendId: toUserId },
        { userId: toUserId, friendId: fromUserId },
      ],
    },
  });

  if (existing) {
    if (existing.status === FriendshipStatus.accepted) throw new Error("Ja sou amics");
    if (existing.status === FriendshipStatus.pending) throw new Error("Ja existeix una sol·licitud pendent");
    // If blocked, etc. handle accordingly, for now simple.
  }

  return await prisma.userFriend.create({
    data: {
      userId: fromUserId,
      friendId: toUserId,
      status: FriendshipStatus.pending,
    },
  });
}

// Get Pending Requests (Received)
export async function getPendingRequests(userId: number) {
  return await prisma.userFriend.findMany({
    where: {
      friendId: userId,
      status: FriendshipStatus.pending,
    },
    include: {
      user: {
        select: { id: true, username: true },
      },
    },
  });
}

// Accept Friend Request
export async function acceptFriendRequest(requestId: number, userId: number) {
  const request = await prisma.userFriend.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error("Sol·licitud no trobada");
  if (request.friendId !== userId) throw new Error("No tens permís per acceptar aquesta sol·licitud");
  if (request.status !== FriendshipStatus.pending) throw new Error("La sol·licitud no està pendent");

  return await prisma.userFriend.update({
    where: { id: requestId },
    data: { status: FriendshipStatus.accepted },
  });
}

// Get Friends List
export async function getFriends(userId: number) {
  // Friends where I initiated
  const initiated = await prisma.userFriend.findMany({
    where: {
      userId: userId,
      status: FriendshipStatus.accepted,
    },
    include: {
      friend: {
        select: { id: true, username: true },
      },
    },
  });

  // Friends where I received
  const received = await prisma.userFriend.findMany({
    where: {
      friendId: userId,
      status: FriendshipStatus.accepted,
    },
    include: {
      user: {
        select: { id: true, username: true },
      },
    },
  });

  // Combine and format
  const friends = [
    ...initiated.map(r => ({ ...r.friend })),
    ...received.map(r => ({ ...r.user })),
  ];

  return friends;
}
