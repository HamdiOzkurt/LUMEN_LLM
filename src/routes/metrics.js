import express from 'express';
import { Log } from '../models/Log.js';

const router = express.Router();

// 📊 Genel istatistik özeti
router.get('/summary', async (req, res) => {
    try {
        const { projectId, startDate, endDate } = req.query;

        const match = {};
        if (projectId) match.projectId = projectId;
        if (startDate || endDate) {
            match.timestamp = {};
            if (startDate) match.timestamp.$gte = new Date(startDate);
            if (endDate) match.timestamp.$lte = new Date(endDate);
        }

        const summary = await Log.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalCalls: { $sum: 1 },
                    successfulCalls: {
                        $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                    },
                    failedCalls: {
                        $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
                    },
                    totalTokens: { $sum: '$totalTokens' },
                    totalCost: { $sum: '$cost' },
                    avgDuration: { $avg: '$duration' },
                    maxDuration: { $max: '$duration' },
                    minDuration: { $min: '$duration' },
                }
            }
        ]);

        res.json(summary[0] || {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            totalTokens: 0,
            totalCost: 0,
            avgDuration: 0,
            maxDuration: 0,
            minDuration: 0,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📈 Provider bazlı breakdown
router.get('/by-provider', async (req, res) => {
    try {
        const { projectId, startDate, endDate } = req.query;

        const match = {};
        if (projectId) match.projectId = projectId;
        if (startDate || endDate) {
            match.timestamp = {};
            if (startDate) match.timestamp.$gte = new Date(startDate);
            if (endDate) match.timestamp.$lte = new Date(endDate);
        }

        const breakdown = await Log.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { provider: '$provider', model: '$model' },
                    calls: { $sum: 1 },
                    tokens: { $sum: '$totalTokens' },
                    cost: { $sum: '$cost' },
                    avgDuration: { $avg: '$duration' },
                }
            },
            { $sort: { cost: -1 } }
        ]);

        res.json(breakdown);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ⏱️ Zaman serisi (time-series) data
router.get('/timeseries', async (req, res) => {
    try {
        const { projectId, interval = 'hour' } = req.query;

        const groupBy = interval === 'day'
            ? { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
            : { $dateToString: { format: '%Y-%m-%dT%H:00:00', date: '$timestamp' } };

        const match = {};
        if (projectId) match.projectId = projectId;

        const timeseries = await Log.aggregate([
            { $match: match },
            {
                $group: {
                    _id: groupBy,
                    calls: { $sum: 1 },
                    tokens: { $sum: '$totalTokens' },
                    cost: { $sum: '$cost' },
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 100 }
        ]);

        res.json(timeseries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
