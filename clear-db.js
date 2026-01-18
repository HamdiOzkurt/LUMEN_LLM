import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Log } from './src/models/Log.js';
import { Session } from './src/models/Session.js';

dotenv.config();

const clearDatabase = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        // 1. Clear Logs
        console.log('🗑️ Clearing Logs...');
        const logResult = await Log.deleteMany({});
        console.log(`   Deleted ${logResult.deletedCount} logs.`);

        // 2. Clear Sessions
        console.log('🗑️ Clearing Sessions...');
        const sessionResult = await Session.deleteMany({});
        console.log(`   Deleted ${sessionResult.deletedCount} sessions.`);

        console.log('✨ Database cleared successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
};

clearDatabase();
