import express from 'express';
import { Log } from '../models/Log.js';

const router = express.Router();

// Yeni log kaydet (SDK'dan gelecek)
router.post('/', async (req, res) => {
    try {
        const log = new Log(req.body);
        await log.save();

        // Real-time broadcast (websocket varsa)
        if (global.io) {
            global.io.to(`project:${log.projectId}`).emit('new-log', log);
        }

        res.status(201).json({ success: true, id: log.id });
    } catch (error) {
        console.error('❌ Log save error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Logları filtrele ve getir
router.get('/', async (req, res) => {
    try {
        const {
            projectId,
            provider,
            model,
            status,
            startDate,
            endDate,
            limit = 100,
            skip = 0,
        } = req.query;

        const filter = {};
        if (projectId) filter.projectId = projectId;
        if (provider) filter.provider = provider;
        if (model) filter.model = model;
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        const logs = await Log.find(filter)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Log.countDocuments(filter);

        res.json({
            logs,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Tek bir log'u ID ile getir
router.get('/:id', async (req, res) => {
    try {
        const log = await Log.findOne({ id: req.params.id });
        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
