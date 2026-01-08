import express from 'express';

const router = express.Router();

// In-memory log storage (MongoDB yerine) - Global yapıyoruz
global.memoryLogs = global.memoryLogs || [];
const memoryLogs = global.memoryLogs;

// Yeni log kaydet (SDK'dan gelecek)
router.post('/', async (req, res) => {
    try {
        const log = {
            ...req.body,
            _id: req.body.id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        memoryLogs.unshift(log); // En yeni başa ekle

        // Max 1000 log tut (memory overflow önleme)
        if (memoryLogs.length > 1000) {
            memoryLogs.pop();
        }

        console.log('✅ Log saved to memory:', {
            provider: log.provider,
            model: log.model,
            tokens: log.totalTokens,
            duration: log.duration + 'ms'
        });

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

        let filteredLogs = [...memoryLogs];

        // Filtreleme
        if (projectId) {
            filteredLogs = filteredLogs.filter(log => log.projectId === projectId);
        }
        if (provider) {
            filteredLogs = filteredLogs.filter(log => log.provider === provider);
        }
        if (model) {
            filteredLogs = filteredLogs.filter(log => log.model === model);
        }
        if (status) {
            filteredLogs = filteredLogs.filter(log => log.status === status);
        }
        if (startDate || endDate) {
            filteredLogs = filteredLogs.filter(log => {
                const logDate = new Date(log.timestamp);
                if (startDate && logDate < new Date(startDate)) return false;
                if (endDate && logDate > new Date(endDate)) return false;
                return true;
            });
        }

        const total = filteredLogs.length;
        const paginatedLogs = filteredLogs.slice(
            parseInt(skip),
            parseInt(skip) + parseInt(limit)
        );

        res.json({
            logs: paginatedLogs,
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
        const log = memoryLogs.find(log => log.id === req.params.id);
        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
