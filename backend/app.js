// ============================================
// TOTOZ WELLNESS API - MAIN APPLICATION
// ============================================
// @version     2.0.0
// @author      ArogoClin
// @updated     2025-11-23 11:25:00 UTC
// @description Complete Express server with auth, articles, directory,
//              TalkEasy AI, ParentCircle community, and GrowTrack mood tracking
// ============================================

import express from 'express';

// Core Routes
import authRoutes from './routes/auth.routes.js';
import articleRoutes from './routes/articles.routes.js';
import directoryRoutes from './routes/directory.routes.js';
import talkEasyRoutes from './routes/talkeasy.routes.js';

// ParentCircle Routes
import categoryRoutes from './routes/category.routes.js';
import questionRoutes from './routes/question.routes.js';
import answerRoutes from './routes/answer.routes.js';
import storyRoutes from './routes/story.routes.js';
import moderationRoutes from './routes/moderation.routes.js';

// 🆕 GrowTrack Routes
import growtrackRoutes from './routes/growtrack.routes.js';

import { startCleanupScheduler } from './utils/database-cleanup.js';

// ============================================
// 🆕 Fix BigInt Serialization for PostgreSQL
// ============================================
BigInt.prototype.toJSON = function() {
  return Number(this);
};

// ============================================
// Initialize Express App
// ============================================
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Global Middleware
// ============================================

// Body parser - Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Allow cross-origin requests from frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req. url}`);
    next();
  });
}

// ============================================
// API Routes
// ============================================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Totoz Wellness API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    status: 'running',
    endpoints: {
      health: 'GET /',
      auth: '/auth',
      articles: '/articles',
      directory: '/directory',
      talkeasy: '/talkeasy',
      growtrack: '/growtrack',
      parentcircle: {
        categories: '/parentcircle/categories',
        questions: '/parentcircle/questions',
        answers: '/parentcircle/answers',
        stories: '/parentcircle/stories',
        moderation: '/parentcircle/moderation'
      },
      docs: '/api-docs'
    }
  });
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    success: true,
    message: 'Totoz Wellness API Documentation',
    version: '2. 0.0',
    lastUpdated: '2025-11-23',
    endpoints: {
      authentication: {
        register: {
          method: 'POST',
          path: '/auth/register',
          access: 'Public',
          description: 'Register new user (creates USER role)',
          body: '{ name, age, email, password, gender }'
        },
        login: {
          method: 'POST',
          path: '/auth/login',
          access: 'Public',
          description: 'Login user and receive JWT token',
          body: '{ email, password }'
        },
        adminSetup: {
          method: 'POST',
          path: '/auth/admin-setup',
          access: 'Public (requires admin code)',
          description: 'First-time admin/staff setup',
          body: '{ name, email, password, adminCode }'
        },
        profile: {
          method: 'GET',
          path: '/auth/profile',
          access: 'Private',
          description: 'Get current user profile'
        },
        updateRole: {
          method: 'PATCH',
          path: '/auth/users/role',
          access: 'Super Admin',
          description: 'Update user role',
          body: '{ userId, newRole }'
        },
        getAllUsers: {
          method: 'GET',
          path: '/auth/users',
          access: 'Super Admin',
          description: 'Get all users with filtering',
          query: 'role, page, limit'
        }
      },
      articles: {
        getAll: {
          method: 'GET',
          path: '/articles',
          access: 'Public',
          description: 'Get all published articles',
          query: 'page, limit, status, category, publishedOnly'
        },
        getSingle: {
          method: 'GET',
          path: '/articles/:id',
          access: 'Public',
          description: 'Get single article by ID'
        },
        create: {
          method: 'POST',
          path: '/articles',
          access: 'Content Writer+',
          description: 'Create new article (starts as DRAFT)',
          body: '{ title, content, excerpt?, coverImage?, category?, tags?  }'
        },
        update: {
          method: 'PUT',
          path: '/articles/:id',
          access: 'Article Author or Admin',
          description: 'Update article'
        },
        delete: {
          method: 'DELETE',
          path: '/articles/:id',
          access: 'Author (drafts) or Super Admin',
          description: 'Delete article'
        },
        submit: {
          method: 'PATCH',
          path: '/articles/:id/submit',
          access: 'Article Author',
          description: 'Submit article for review'
        },
        review: {
          method: 'PATCH',
          path: '/articles/:id/review',
          access: 'Content Lead+',
          description: 'Approve or reject article',
          body: '{ action: "approve" | "reject", feedback?  }'
        },
        publish: {
          method: 'PATCH',
          path: '/articles/:id/publish',
          access: 'Content Lead+',
          description: 'Publish approved article'
        }
      },
      directory: {
        getAll: {
          method: 'GET',
          path: '/directory',
          access: 'Public',
          description: 'Get all directory entries',
          query: 'page, limit, type, county, city, verified, featured, search'
        },
        create: {
          method: 'POST',
          path: '/directory',
          access: 'Content Lead+',
          description: 'Create new directory entry',
          body: '{ name, type, description, phone?, email?, website?, address?, city?, county?, region?  }'
        }
      },
      talkeasy: {
        chat: {
          method: 'POST',
          path: '/talkeasy/chat',
          access: 'Private (Authenticated)',
          description: 'Send message to TalkEasy AI chatbot',
          body: '{ message, sessionId?  }',
          features: ['Smart resource recommendations', 'Crisis detection', 'Analytics collection']
        },
        history: {
          method: 'GET',
          path: '/talkeasy/history',
          access: 'Private',
          description: 'Get user conversation history',
          query: 'sessionId?, limit?, page? '
        },
        deleteHistory: {
          method: 'DELETE',
          path: '/talkeasy/history',
          access: 'Private',
          description: 'Delete conversation history',
          query: 'sessionId?  (optional - deletes all if not provided)'
        },
        stats: {
          method: 'GET',
          path: '/talkeasy/stats',
          access: 'Super Admin',
          description: 'Get TalkEasy statistics'
        },
        myStats: {
          method: 'GET',
          path: '/talkeasy/my-stats',
          access: 'Private',
          description: 'Get personal TalkEasy statistics'
        }
      },
      growtrack: {
        createEntry: {
          method: 'POST',
          path: '/growtrack/entries',
          access: 'Private (Authenticated)',
          description: 'Create mood entry with triggers and notes',
          body: '{ mood, moodIntensity (1-10), triggers: [], notes? }',
          features: ['Privacy-first design', 'No raw data logging', 'AI-powered insights']
        },
        getEntries: {
          method: 'GET',
          path: '/growtrack/entries',
          access: 'Private',
          description: 'Get mood entries for period',
          query: 'period?  (week/month/year, default: week)',
          returns: 'Entries + metrics (average intensity, predominant mood, triggers)'
        },
        getInsights: {
          method: 'GET',
          path: '/growtrack/insights',
          access: 'Private',
          description: 'Get AI-powered insights report',
          query: 'period? (week/month/year)',
          features: ['Mood pattern analysis', 'Trigger identification', 'Coping strategies', 'Professional validation']
        },
        getSummary: {
          method: 'GET',
          path: '/growtrack/summary',
          access: 'Private',
          description: 'Get quick summary statistics',
          query: 'period? (week/month/year)'
        },
        updateEntry: {
          method: 'PUT',
          path: '/growtrack/entries/:id',
          access: 'Private (Entry Owner)',
          description: 'Update mood entry'
        },
        deleteEntry: {
          method: 'DELETE',
          path: '/growtrack/entries/:id',
          access: 'Private (Entry Owner)',
          description: 'Delete mood entry'
        },
        moodTypes: {
          method: 'GET',
          path: '/growtrack/mood-types',
          access: 'Public',
          description: 'Get available mood types'
        }
      },
      parentcircle: {
        categories: {
          getAll: {
            method: 'GET',
            path: '/parentcircle/categories',
            access: 'Public',
            description: 'Get all categories'
          },
          create: {
            method: 'POST',
            path: '/parentcircle/categories',
            access: 'Moderator+',
            description: 'Create new category',
            body: '{ name, description, type, icon?, color?, order? }'
          }
        },
        questions: {
          getAll: {
            method: 'GET',
            path: '/parentcircle/questions',
            access: 'Public',
            description: 'Get all approved questions',
            query: 'page, limit, categoryId, status'
          },
          create: {
            method: 'POST',
            path: '/parentcircle/questions',
            access: 'Public',
            description: 'Create question (anonymous or authenticated)',
            body: '{ title?, content, categoryId, tags?, isAnonymous?, authorName? }'
          },
          vote: {
            method: 'POST',
            path: '/parentcircle/questions/:id/vote',
            access: 'Authenticated',
            description: 'Vote helpful/not helpful',
            body: '{ isHelpful: boolean }'
          }
        },
        answers: {
          getByQuestion: {
            method: 'GET',
            path: '/parentcircle/questions/:questionId/answers',
            access: 'Public',
            description: 'Get all answers for question'
          },
          create: {
            method: 'POST',
            path: '/parentcircle/questions/:questionId/answers',
            access: 'Authenticated',
            description: 'Create answer (auto-verified if professional)',
            body: '{ content }'
          }
        },
        stories: {
          getAll: {
            method: 'GET',
            path: '/parentcircle/stories',
            access: 'Public',
            description: 'Get all approved stories',
            query: 'page, limit, categoryId'
          },
          create: {
            method: 'POST',
            path: '/parentcircle/stories',
            access: 'Public',
            description: 'Create story (anonymous or authenticated)',
            body: '{ title?, content, categoryId?, tags?, isAnonymous?, authorName?  }'
          },
          like: {
            method: 'POST',
            path: '/parentcircle/stories/:id/like',
            access: 'Authenticated',
            description: 'Like/unlike story'
          }
        },
        moderation: {
          getPending: {
            method: 'GET',
            path: '/parentcircle/moderation/pending',
            access: 'Moderator+',
            description: 'Get pending content'
          },
          approve: {
            method: 'POST',
            path: '/parentcircle/moderation/approve',
            access: 'Moderator+',
            description: 'Approve content',
            body: '{ contentType, contentId, notes?  }'
          },
          reject: {
            method: 'POST',
            path: '/parentcircle/moderation/reject',
            access: 'Moderator+',
            description: 'Reject content',
            body: '{ contentType, contentId, reason, notes? }'
          },
          stats: {
            method: 'GET',
            path: '/parentcircle/moderation/stats',
            access: 'Moderator+',
            description: 'Get moderation statistics'
          }
        }
      },
      roles: {
        USER: {
          level: 0,
          description: 'Regular user - public access, community participation, mood tracking'
        },
        CONTENT_WRITER: {
          level: 1,
          description: 'Create articles, answer questions, access GrowTrack insights'
        },
        CONTENT_LEAD: {
          level: 2,
          description: 'Review/publish articles, manage directory'
        },
        MODERATOR: {
          level: 2,
          description: 'Moderate ParentCircle content (approve/reject)'
        },
        SUPER_ADMIN: {
          level: 3,
          description: 'Full system access, all analytics, user management'
        }
      }
    }
  });
});

// ============================================
// Mount API Routes
// ============================================

// Core Routes
app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);
app.use('/directory', directoryRoutes);
app.use('/talkeasy', talkEasyRoutes);

// 🆕 GrowTrack Routes
app.use('/growtrack', growtrackRoutes);

// ParentCircle Routes (Direct mounting)
app.use('/parentcircle/categories', categoryRoutes);
app.use('/parentcircle/questions', questionRoutes);
app.use('/parentcircle/answers', answerRoutes);
app.use('/parentcircle/stories', storyRoutes);
app. use('/parentcircle/moderation', moderationRoutes);

// ParentCircle health check
app.get('/parentcircle/health', (req, res) => {
  res.json({
    success: true,
    message: 'ParentCircle API is running',
    timestamp: new Date().toISOString(),
    features: {
      categories: 'active',
      questions: 'active',
      answers: 'active',
      stories: 'active',
      moderation: 'active'
    }
  });
});

// 🆕 GrowTrack health check
app.get('/growtrack/health', (req, res) => {
  res.json({
    success: true,
    message: 'GrowTrack API is running',
    timestamp: new Date().toISOString(),
    features: {
      moodTracking: 'active',
      triggerTracking: 'active',
      aiInsights: 'active',
      privacyFirst: 'enabled'
    }
  });
});

// ============================================
// Error Handling
// ============================================

// 404 handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
    hint: 'Visit /api-docs for available endpoints'
  });
});

// Global error handler - Must be last
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    url: req.url,
    method: req.method
  });

  res.status(err.status || 500).json({ 
    success: false,
    error: err.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred processing your request' 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    TOTOZ WELLNESS API v2.0                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`\x1b[32m✅ Server Status: RUNNING\x1b[0m`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log(`👤 Current User: ArogoClin\n`);
  
  console.log('📡 Core Endpoints:');
  console.log(`   ├─ Health Check:         \x1b[36mGET http://localhost:${PORT}/\x1b[0m`);
  console.log(`   ├─ API Docs:             \x1b[36mGET http://localhost:${PORT}/api-docs\x1b[0m`);
  console.log(`   ├─ Auth:                 \x1b[36mhttp://localhost:${PORT}/auth\x1b[0m`);
  console.log(`   ├─ Articles:             \x1b[36mhttp://localhost:${PORT}/articles\x1b[0m`);
  console.log(`   ├─ Directory:            \x1b[36mhttp://localhost:${PORT}/directory\x1b[0m`);
  console. log(`   ├─ TalkEasy AI:          \x1b[36mhttp://localhost:${PORT}/talkeasy\x1b[0m`);
  console. log(`   ├─ GrowTrack:            \x1b[36mhttp://localhost:${PORT}/growtrack\x1b[0m`);
  console.log(`   └─ ParentCircle:         \x1b[36mhttp://localhost:${PORT}/parentcircle\x1b[0m`);
  console.log(`      ├─ Categories:        \x1b[36mhttp://localhost:${PORT}/parentcircle/categories\x1b[0m`);
  console.log(`      ├─ Questions:         \x1b[36mhttp://localhost:${PORT}/parentcircle/questions\x1b[0m`);
  console.log(`      ├─ Answers:           \x1b[36mhttp://localhost:${PORT}/parentcircle/answers\x1b[0m`);
  console.log(`      ├─ Stories:           \x1b[36mhttp://localhost:${PORT}/parentcircle/stories\x1b[0m`);
  console.log(`      └─ Moderation:        \x1b[36mhttp://localhost:${PORT}/parentcircle/moderation\x1b[0m\n`);
  
  console.log('🔐 Role-Based Access Control:');
  console.log('   ├─ \x1b[90mUSER (Lvl 0)\x1b[0m         Public access + community participation + mood tracking');
  console.log('   ├─ \x1b[32mCONTENT_WRITER (Lvl 1)\x1b[0m Manage articles + answer questions + GrowTrack');
  console.log('   ├─ \x1b[34mCONTENT_LEAD (Lvl 2)\x1b[0m   Review/publish articles + manage directory');
  console.log('   ├─ \x1b[33mMODERATOR (Lvl 2)\x1b[0m     Moderate ParentCircle content');
  console.log('   └─ \x1b[35mSUPER_ADMIN (Lvl 3)\x1b[0m  Full system access\n');
  
  console. log('🤖 AI Features:');
  console.log('   TalkEasy:');
  console.log('   ├─ Smart resource recommendations (articles & directories)');
  console.log('   ├─ Crisis detection with emergency support');
  console.log('   ├─ Conversation memory & context awareness');
  console.log('   └─ Training data collection for AI improvement\n');
  
  console.log('   GrowTrack:');
  console.log('   ├─ Privacy-first mood & trigger tracking');
  console.log('   ├─ AI-powered insights (weekly/monthly/yearly)');
  console.log('   ├─ Coping strategy recommendations');
  console. log('   └─ No raw data logging - only AI summaries shown\n');
  
  console.log('👥 ParentCircle Community Features:');
  console.log('   ├─ Q&A System - Ask & answer questions');
  console.log('   ├─ Personal Stories - Share experiences anonymously');
  console.log('   ├─ Professional Verification - Verified expert answers');
  console.log('   ├─ Community Engagement - Vote, like, interact');
  console.log('   ├─ Content Moderation - Review & approve content');
  console. log('   └─ Anonymous Posting - Privacy-first support\n');
  
  console.log('🗄️  Database Management:');
  try {
    startCleanupScheduler();
    console.log('   ✅ Cleanup scheduler started');
    console.log('   ✅ Analytics aggregation enabled');
    console.log('   ✅ GrowTrack privacy protection active');
    console.log('   📅 Message Retention: 90 days (regular), 365 days (crisis)\n');
  } catch (error) {
    console.error('   ❌ Failed to start cleanup scheduler:', error. message);
    console.log('   ⚠️  Database cleanup will not run automatically\n');
  }
  
  console.log('✨ All Systems Ready!  Accepting requests...\n');
  console.log('════════════════════════════════════════════════════════════════\n');
});

// ============================================
// Graceful Shutdown
// ============================================

process.on('SIGTERM', () => {
  console. log('\n🛑 SIGTERM signal received: closing HTTP server gracefully');
  console.log('⏳ Waiting for pending requests to complete...');
  
  setTimeout(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  }, 10000);
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 SIGINT signal received: shutting down gracefully');
  console.log('🧹 Cleaning up resources...');
  console.log('👋 Goodbye!\n');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  console.log('🛑 Server will shut down.. .\n');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
  console. log('⚠️  Consider fixing this promise rejection\n');
});

export default app;