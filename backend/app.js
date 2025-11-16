// app.js
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import articleRoutes from './routes/articles.routes.js';
import directoryRoutes from './routes/directory.routes.js';
import talkEasyRoutes from './routes/talkeasy.routes.js';
// 🆕 ParentCircle Routes - Direct imports
import categoryRoutes from './routes/category.routes.js';
import questionRoutes from './routes/question.routes.js';
import answerRoutes from './routes/answer.routes.js';
import storyRoutes from './routes/story.routes.js';
import moderationRoutes from './routes/moderation.routes.js';

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
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
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
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'running',
    endpoints: {
      health: 'GET /',
      auth: '/auth',
      articles: '/articles',
      directory: '/directory',
      talkeasy: '/talkeasy',
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
    version: '1.0.0',
    endpoints: {
      authentication: {
        register: {
          method: 'POST',
          path: '/auth/register',
          access: 'Public',
          description: 'Register new user (creates USER role)'
        },
        login: {
          method: 'POST',
          path: '/auth/login',
          access: 'Public',
          description: 'Login user and receive JWT token'
        },
        adminSetup: {
          method: 'POST',
          path: '/auth/admin-setup',
          access: 'Public (requires admin code)',
          description: 'First-time admin/staff setup'
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
          description: 'Update user role'
        },
        getAllUsers: {
          method: 'GET',
          path: '/auth/users',
          access: 'Super Admin',
          description: 'Get all users with filtering'
        }
      },
      articles: {
        getAll: {
          method: 'GET',
          path: '/articles',
          access: 'Public',
          description: 'Get all published articles (or all if authenticated)',
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
          description: 'Create new article (starts as DRAFT)'
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
          access: 'Author (drafts) or Super Admin (all)',
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
          body: '{ action: "approve" | "reject", feedback?: string }'
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
          description: 'Create new directory entry'
        }
      },
      talkeasy: {
        chat: {
          method: 'POST',
          path: '/talkeasy/chat',
          access: 'Private (All authenticated users)',
          description: 'Send a message to TalkEasy chatbot',
          body: '{ message: string, sessionId?: string }'
        },
        history: {
          method: 'GET',
          path: '/talkeasy/history',
          access: 'Private (Own history only)',
          description: 'Get user\'s conversation history'
        }
      },
      // 🆕 ParentCircle Endpoints
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
            description: 'Get all approved questions'
          },
          create: {
            method: 'POST',
            path: '/parentcircle/questions',
            access: 'Public/Authenticated',
            description: 'Create new question (anonymous or authenticated)',
            body: '{ title?, content, categoryId, tags?, isAnonymous?, authorName? }'
          },
          vote: {
            method: 'POST',
            path: '/parentcircle/questions/:id/vote',
            access: 'Authenticated',
            description: 'Vote on question (helpful/not helpful)',
            body: '{ isHelpful: boolean }'
          }
        },
        answers: {
          getByQuestion: {
            method: 'GET',
            path: '/parentcircle/questions/:questionId/answers',
            access: 'Public',
            description: 'Get all answers for a question'
          },
          create: {
            method: 'POST',
            path: '/parentcircle/questions/:questionId/answers',
            access: 'Authenticated (All users)',
            description: 'Create new answer (professionals auto-verified)',
            body: '{ content }'
          }
        },
        stories: {
          getAll: {
            method: 'GET',
            path: '/parentcircle/stories',
            access: 'Public',
            description: 'Get all approved stories'
          },
          create: {
            method: 'POST',
            path: '/parentcircle/stories',
            access: 'Public/Authenticated',
            description: 'Create new story (anonymous or authenticated)',
            body: '{ title?, content, categoryId?, tags?, isAnonymous?, authorName? }'
          },
          like: {
            method: 'POST',
            path: '/parentcircle/stories/:id/like',
            access: 'Authenticated',
            description: 'Like/unlike story (toggle)'
          }
        },
        moderation: {
          getPending: {
            method: 'GET',
            path: '/parentcircle/moderation/pending',
            access: 'Moderator+',
            description: 'Get all pending content for moderation'
          },
          approve: {
            method: 'POST',
            path: '/parentcircle/moderation/approve',
            access: 'Moderator+',
            description: 'Approve content',
            body: '{ contentType, contentId, notes? }'
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
          description: 'Regular user - public access, can post questions/stories/answers'
        },
        CONTENT_WRITER: {
          level: 1,
          description: 'Can create and manage own articles, submit for review, answer questions'
        },
        CONTENT_LEAD: {
          level: 2,
          description: 'Can review, approve, publish articles and manage directory'
        },
        MODERATOR: {
          level: 2,
          description: '🆕 Can moderate ParentCircle content (approve/reject questions/stories/answers)'
        },
        SUPER_ADMIN: {
          level: 3,
          description: 'Full access - can delete articles, manage users, full ParentCircle control'
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

// 🆕 ParentCircle Routes (Direct mounting)
app.use('/parentcircle/categories', categoryRoutes);
app.use('/parentcircle/questions', questionRoutes);
app.use('/parentcircle/answers', answerRoutes);
app.use('/parentcircle/stories', storyRoutes);
app.use('/parentcircle/moderation', moderationRoutes);

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

// ============================================
// Error Handling
// ============================================

// 404 handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
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
  console.log('║                    TOTOZ WELLNESS API                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log(`🚀 Server Status: ${'\x1b[32m'}RUNNING${'\x1b[0m'}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log(`👤 Current User: ArogoClin\n`);
  
  console.log('📡 Available Endpoints:');
  console.log('   ├─ Health Check:         \x1b[36mhttp://localhost:' + PORT + '/\x1b[0m');
  console.log('   ├─ API Docs:             \x1b[36mhttp://localhost:' + PORT + '/api-docs\x1b[0m');
  console.log('   ├─ Auth Routes:          \x1b[36mhttp://localhost:' + PORT + '/auth\x1b[0m');
  console.log('   ├─ Articles:             \x1b[36mhttp://localhost:' + PORT + '/articles\x1b[0m');
  console.log('   ├─ Directory:            \x1b[36mhttp://localhost:' + PORT + '/directory\x1b[0m');
  console.log('   ├─ TalkEasy:             \x1b[36mhttp://localhost:' + PORT + '/talkeasy/chat\x1b[0m');
  console.log('   └─ ParentCircle:         \x1b[36mhttp://localhost:' + PORT + '/parentcircle\x1b[0m');
  console.log('      ├─ Categories:        \x1b[36mhttp://localhost:' + PORT + '/parentcircle/categories\x1b[0m');
  console.log('      ├─ Questions:         \x1b[36mhttp://localhost:' + PORT + '/parentcircle/questions\x1b[0m');
  console.log('      ├─ Answers:           \x1b[36mhttp://localhost:' + PORT + '/parentcircle/answers\x1b[0m');
  console.log('      ├─ Stories:           \x1b[36mhttp://localhost:' + PORT + '/parentcircle/stories\x1b[0m');
  console.log('      └─ Moderation:        \x1b[36mhttp://localhost:' + PORT + '/parentcircle/moderation\x1b[0m\n');
  
  console.log('🔐 Role-Based Access Control:');
  console.log('   ├─ \x1b[90mUSER\x1b[0m              (Level 0) - Public access + community participation');
  console.log('   ├─ \x1b[32mCONTENT_WRITER\x1b[0m    (Level 1) - Manage own articles + answer questions');
  console.log('   ├─ \x1b[34mCONTENT_LEAD\x1b[0m      (Level 2) - Review & publish articles');
  console.log('   ├─ \x1b[33mMODERATOR\x1b[0m         (Level 2) - Moderate ParentCircle content');
  console.log('   └─ \x1b[35mSUPER_ADMIN\x1b[0m       (Level 3) - Full system access\n');
  
  console.log('🤖 TalkEasy AI Features:');
  console.log('   ├─ Smart resource recommendations (articles & directories)');
  console.log('   ├─ Conversation memory & context awareness');
  console.log('   ├─ Crisis detection with immediate support');
  console.log('   ├─ Analytics & insights collection');
  console.log('   └─ Training data preparation for future AI\n');
  
  console.log('👥 ParentCircle Community Features:');
  console.log('   ├─ Q&A System - Parents ask, experts & community answer');
  console.log('   ├─ Personal Stories - Share experiences anonymously');
  console.log('   ├─ Professional Verification - Verified expert answers');
  console.log('   ├─ Community Engagement - Vote, like, and interact');
  console.log('   ├─ Content Moderation - Review & approve user content');
  console.log('   └─ Anonymous Posting - Privacy-first support\n');
  
  console.log('🗄️  Database Management:');
  try {
    startCleanupScheduler();
    console.log('   ✅ Cleanup scheduler started');
    console.log('   ✅ Analytics aggregation enabled');
    console.log('   📅 Retention: 90 days (regular), 365 days (crisis)\n');
  } catch (error) {
    console.error('   ❌ Failed to start cleanup scheduler:', error.message);
    console.log('   ⚠️  Database cleanup will not run automatically\n');
  }
  
  console.log('✨ Ready to accept requests!\n');
  console.log('════════════════════════════════════════════════════════════════\n');
});

// ============================================
// Graceful Shutdown
// ============================================

process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM signal received: closing HTTP server gracefully');
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
  console.log('🛑 Server will shut down...\n');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
  console.log('⚠️  Consider fixing this promise rejection\n');
});