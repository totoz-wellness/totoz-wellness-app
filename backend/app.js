import express from 'express';
import authRoutes from './routes/auth.routes.js';
import articleRoutes from './routes/articles.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON bodies

// CORS middleware (for frontend communication)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Totoz Wellness API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        profile: 'GET /auth/profile'
      },
      articles: {
        getAll: 'GET /articles',
        getSingle: 'GET /articles/:id',
        create: 'POST /articles',
        update: 'PUT /articles/:id',
        delete: 'DELETE /articles/:id',
        submit: 'PATCH /articles/:id/submit',
        review: 'PATCH /articles/:id/review',
        publish: 'PATCH /articles/:id/publish'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// 404 handler - catches all unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`🔑 Auth routes: http://localhost:${PORT}/auth/`);
  console.log(`📚 Article routes: http://localhost:${PORT}/articles/`);
  console.log('\n📖 Available Article Endpoints:');
  console.log('   GET    /articles              - Get all articles');
  console.log('   GET    /articles/:id          - Get single article');
  console.log('   POST   /articles              - Create article (Protected)');
  console.log('   PUT    /articles/:id          - Update article (Protected)');
  console.log('   DELETE /articles/:id          - Delete article (Protected)');
  console.log('   PATCH  /articles/:id/submit   - Submit for review (Protected)');
  console.log('   PATCH  /articles/:id/review   - Review article (Content Lead+)');
  console.log('   PATCH  /articles/:id/publish  - Publish article (Content Lead+)');
});