// utils/database-cleanup.js
import { PrismaClient } from '@prisma/client';
import { AnalyticsService } from '../services/analytics.service.js';

const prisma = new PrismaClient();

const CLEANUP_CONFIG = {
  ENABLED: process.env.DB_CLEANUP_ENABLED === 'true',
  RETENTION_DAYS: parseInt(process.env.DB_RETENTION_DAYS || '90'),
  CRISIS_RETENTION_DAYS: parseInt(process.env.DB_CRISIS_RETENTION_DAYS || '365'),
  RUN_INTERVAL_HOURS: parseInt(process.env.DB_CLEANUP_INTERVAL_HOURS || '24')
};

export const cleanupOldMessages = async () => {
  if (!CLEANUP_CONFIG.ENABLED) return { success: false, message: 'Cleanup disabled' };

  try {
    const now = new Date();
    const regularCutoff = new Date(now.getTime() - CLEANUP_CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const crisisCutoff = new Date(now.getTime() - CLEANUP_CONFIG.CRISIS_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    console.log('🧹 Starting database cleanup...');

    const deletedRegular = await prisma.talkEasyMessage.deleteMany({
      where: {
        sentiment: { notIn: ['CRISIS'] },
        timestamp: { lt: regularCutoff }
      }
    });

    const deletedCrisis = await prisma.talkEasyMessage.deleteMany({
      where: {
        sentiment: 'CRISIS',
        timestamp: { lt: crisisCutoff }
      }
    });

    const totalDeleted = deletedRegular.count + deletedCrisis.count;

    console.log(`✅ Cleanup complete: Deleted ${totalDeleted} old messages`);
    console.log(`   - Regular: ${deletedRegular.count}`);
    console.log(`   - Crisis (>1yr): ${deletedCrisis.count}`);

    return { success: true, totalDeleted };

  } catch (error) {
    console.error('❌ Database cleanup error:', error);
    return { success: false, error: error.message };
  }
};

export const startCleanupScheduler = () => {
  if (!CLEANUP_CONFIG.ENABLED) {
    console.log('⏸️  Database cleanup is disabled (set DB_CLEANUP_ENABLED=true)');
    return;
  }

  console.log(`🔄 Database cleanup scheduler started (runs every ${CLEANUP_CONFIG.RUN_INTERVAL_HOURS}h)`);
  
  runDailyTasks();
  setInterval(runDailyTasks, CLEANUP_CONFIG.RUN_INTERVAL_HOURS * 60 * 60 * 1000);
};

async function runDailyTasks() {
  try {
    console.log('\n🔄 Running daily maintenance...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await AnalyticsService.aggregateDailyAnalytics(yesterday);
    
    await cleanupOldMessages();
    
    console.log('✅ Daily maintenance complete\n');
  } catch (error) {
    console.error('❌ Daily maintenance error:', error);
  }
}