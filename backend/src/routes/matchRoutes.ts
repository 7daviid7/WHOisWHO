import { Router } from 'express';
import * as matchService from '../services/matchService';

const router = Router();

// GET /api/matches?username=x&page=1
router.get('/', async (req, res) => {
    try {
        const { username, page, limit } = req.query;

        if (!username) {
            return res.status(400).json({ error: 'Username required' });
        }

        const data = await matchService.getMatchHistory(
            username as string,
            page ? parseInt(page as string) : 1,
            limit ? parseInt(limit as string) : 10
        );

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
