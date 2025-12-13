import express from 'express';
import bcrypt from 'bcryptjs';
import { findUser, updateUser } from '../services/userService';

const router = express.Router();

router.put('/users/profile', async (req, res) => {
    const { currentUsername, newUsername, newPassword } = req.body;

    if (!currentUsername) {
        return res.status(400).json({ error: "Missing current username" });
    }

    try {
        const user = await findUser(currentUsername);
        if (!user) return res.status(404).json({ error: "User not found" });

        const updateData: any = {};
        if (newUsername && newUsername !== currentUsername) {
            // Check if taken
            const existing = await findUser(newUsername);
            if (existing) return res.status(400).json({ error: "Username already taken" });
            updateData.username = newUsername;
        }

        if (newPassword) {
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return res.json({ message: "No changes made", user });
        }

        const updated = await updateUser(user.id, updateData);
        // Don't send password back
        const { password, ...safeUser } = updated;
        res.json({ message: "Profile updated", user: safeUser });

    } catch (err: any) {
        console.error("Update profile error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
