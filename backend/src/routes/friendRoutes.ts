import express from 'express';
import { findUser } from '../services/userService';
import {
    searchUsers,
    sendFriendRequest,
    getPendingRequests,
    acceptFriendRequest,
    getFriends
} from '../services/friendService';
import { getOnlineUsers } from '../services/redisService';

const router = express.Router();

// Search users
router.get('/users', async (req, res) => {
    const query = req.query.q as string;
    const username = req.query.username as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || !username) return res.status(400).json({ error: "Missing query or username" });

    try {
        const user = await findUser(username);
        if (!user) return res.status(404).json({ error: "User not found" });

        const results = await searchUsers(query, user.id, page, limit);
        res.json(results);
    } catch (err) {
        console.error("Search error", err);
        res.status(500).json({ error: "Internal error" });
    }
});

// Get friends list
router.get('/friends', async (req, res) => {
    const username = req.query.username as string;
    if (!username) return res.status(400).json({ error: "Missing username" });

    try {
        const user = await findUser(username);
        if (!user) return res.status(404).json({ error: "User not found" });

        const friends = await getFriends(user.id);

        // Attach online status
        const onlineUsers = await getOnlineUsers();
        const friendsWithStatus = friends.map(f => ({
            ...f,
            isOnline: onlineUsers.includes(f.username)
        }));

        res.json(friendsWithStatus);
    } catch (err) {
        console.error("Get friends error", err);
        res.status(500).json({ error: "Internal error" });
    }
});

// Send friend request
router.post('/friends/request', async (req, res) => {
    const { fromUsername, toUserId } = req.body;
    if (!fromUsername || !toUserId) return res.status(400).json({ error: "Missing data" });

    try {
        const fromUser = await findUser(fromUsername);
        if (!fromUser) return res.status(404).json({ error: "User not found" });

        const request = await sendFriendRequest(fromUser.id, toUserId);
        res.json(request);
    } catch (err: any) {
        console.error("Friend request error", err);
        res.status(400).json({ error: err.message || "Error sending request" });
    }
});

// Get pending requests
router.get('/friends/requests', async (req, res) => {
    const username = req.query.username as string;
    if (!username) return res.status(400).json({ error: "Missing username" });

    try {
        const user = await findUser(username);
        if (!user) return res.status(404).json({ error: "User not found" });

        const requests = await getPendingRequests(user.id);
        res.json(requests);
    } catch (err) {
        console.error("Get requests error", err);
        res.status(500).json({ error: "Internal error" });
    }
});

// Accept friend request
router.post('/friends/accept', async (req, res) => {
    const { requestId, username } = req.body;

    try {
        const user = await findUser(username);
        if (!user) return res.status(404).json({ error: "User not found" });

        const result = await acceptFriendRequest(requestId, user.id);
        res.json(result);
    } catch (err: any) {
        console.error("Accept request error", err);
        res.status(400).json({ error: err.message || "Error accepting request" });
    }
});

export default router;
