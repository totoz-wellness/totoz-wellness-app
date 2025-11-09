import express from 'express';
import authRoutes from './routes/auth.routes.js';
import articleRoutes from './routes/articles.routes.js';
import directoryRoutes from './routes/directory.routes.js';
import talkEasyRoutes from './routes/talkeasy.routes.js';

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
        getSingleAdmin: {
          method: 'GET',
          path: '/articles/:id/admin',
          access: 'Private (Author or Admin)',
          description: 'Get article with any status (admin view)'
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
          description: 'Update article (resets to DRAFT if published)'
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
        },
        unpublish: {
          method: 'PATCH',
          path: '/articles/:id/unpublish',
          access: 'Content Lead+',
          description: 'Unpublish published article'
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
        getSingle: {
          method: 'GET',
          path: '/directory/:id',
          access: 'Public',
          description: 'Get single directory entry by ID'
        },
        getStats: {
          method: 'GET',
          path: '/directory/stats',
          access: 'Content Lead+',
          description: 'Get directory statistics'
        },
        create: {
          method: 'POST',
          path: '/directory',
          access: 'Content Lead+',
          description: 'Create new directory entry'
        },
        update: {
          method: 'PUT',
          path: '/directory/:id',
          access: 'Content Lead+',
          description: 'Update directory entry'
        },
        delete: {
          method: 'DELETE',
          path: '/directory/:id',
          access: 'Content Lead+',
          description: 'Delete directory entry'
        }
      },
      talkeasy: {
        chat: {
          method: 'POST',
          path: '/chat',
          access: 'Private (All authenticated users)',
          description: 'Send a message to TalkEasy chatbot',
          body: '{ message: string, sessionId?: string }'
        },
        history: {
          method: 'GET',
          path: '/history',
          access: 'Private (Own history only)',
          description: 'Get user\'s conversation history',
          query: 'sessionId?, limit?, page?'
        },
        deleteHistory: {
          method: 'DELETE',
          path: '/history',
          access: 'Private (Own history only)',
          description: 'Delete user\'s conversation history',
          query: 'sessionId? (optional - deletes all if not provided)'
        },
        stats: {
          method: 'GET',
          path: '/stats',
          access: 'Private (Super Admin only)',
          description: 'Get TalkEasy statistics'
        }
      },
      roles: {
        USER: {
          level: 0,
          description: 'Regular user - public access only'
        },
        CONTENT_WRITER: {
          level: 1,
          description: 'Can create and manage own articles, submit for review'
        },
        CONTENT_LEAD: {
          level: 2,
          description: 'Can review, approve, publish articles and manage directory'
        },
        SUPER_ADMIN: {
          level: 3,
          description: 'Full access - can delete articles and manage users'
        }
      }
    }
  });
});

// Mount API routes
app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);
app.use('/directory', directoryRoutes);
app.use('/talkeasy', talkEasyRoutes);

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
  console.log('   ├─ Health Check:    \x1b[36mhttp://localhost:' + PORT + '/\x1b[0m');
  console.log('   ├─ API Docs:        \x1b[36mhttp://localhost:' + PORT + '/api-docs\x1b[0m');
  console.log('   ├─ Auth Routes:     \x1b[36mhttp://localhost:' + PORT + '/auth\x1b[0m');
  console.log('   ├─ Articles:        \x1b[36mhttp://localhost:' + PORT + '/articles\x1b[0m');
  console.log('   ├─ Directory:      \x1b[36mhttp://localhost:' + PORT + '/directory\x1b[0m\n');
  console.log('   └─ TalkEasy:       \x1b[36mhttp://localhost:' + PORT + '/talkeasy\x1b[0m\n');
  
  console.log('🔐 Role-Based Access Control:');
  console.log('   ├─ \x1b[90mUSER\x1b[0m              (Level 0) - Public access');
  console.log('   ├─ \x1b[32mCONTENT_WRITER\x1b[0m    (Level 1) - Manage own articles');
  console.log('   ├─ \x1b[34mCONTENT_LEAD\x1b[0m      (Level 2) - Review & publish');
  console.log('   └─ \x1b[35mSUPER_ADMIN\x1b[0m       (Level 3) - Full access\n');
  
  console.log('✨ Ready to accept requests!\n');
  console.log('════════════════════════════════════════════════════════════════\n');
});

// ============================================
// Graceful Shutdown
// ============================================

process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM signal received: closing HTTP server gracefully');
  app.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 SIGINT signal received: shutting down gracefully');
  console.log('👋 Goodbye!\n');
  process.exit(0);
});