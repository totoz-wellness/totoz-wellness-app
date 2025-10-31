import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getCurrentDateTime = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(`🔐 [${getCurrentDateTime()}] authenticateToken - ${req.method} ${req.url}:`, {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      authHeaderPreview: authHeader ? authHeader.substring(0, 30) + '...' : 'none'
    });

    if (!token) {
      console.log(`⚠️ [${getCurrentDateTime()}] No token - continuing as public`);
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log(`🔓 [${getCurrentDateTime()}] Token decoded:`, {
      userId: decoded.userId,
      email: decoded.email
    });

    // CRITICAL: Fetch FULL user including role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      console.log(`❌ [${getCurrentDateTime()}] User not found in DB: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ [${getCurrentDateTime()}] User authenticated:`, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Set FULL user data
    req.user = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Auth error:`, {
      error: error.message,
      name: error.name
    });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Token expired'
      });
    }

    // Continue without auth for public access
    return next();
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    console.log(`❌ [${getCurrentDateTime()}] Auth required but no user`);
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  console.log(`✅ [${getCurrentDateTime()}] Auth check passed: ${req.user.name} (${req.user.role})`);
  next();
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log(`❌ [${getCurrentDateTime()}] Role check - no user`);
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`❌ [${getCurrentDateTime()}] Role check failed:`, {
        user: req.user.name,
        userRole: req.user.role,
        requiredRoles: allowedRoles
      });
      return res.status(403).json({
        success: false,
        message: `Access denied. Required: ${allowedRoles.join(' or ')}`
      });
    }

    console.log(`✅ [${getCurrentDateTime()}] Role check passed: ${req.user.name} (${req.user.role})`);
    next();
  };
};