import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getCurrentDateTime = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * ✅ OPTIONAL AUTHENTICATION
 * Sets req.user if valid token exists, but continues without error if missing
 * Use for PUBLIC routes that can benefit from user context (e.g., /articles)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(`🔓 [${getCurrentDateTime()}] optionalAuth - ${req.method} ${req.url}:`, {
      hasAuthHeader: !! authHeader,
      hasToken: !!token
    });

    // No token = continue as public user
    if (!token) {
      console.log(`👤 [${getCurrentDateTime()}] No token - continuing as public user`);
      req.user = null;
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console. log(`🔓 [${getCurrentDateTime()}] Token decoded:`, {
        userId: decoded.userId,
        email: decoded.email
      });

      // Fetch full user including role
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
        console.log(`⚠️ [${getCurrentDateTime()}] User not found - continuing as public`);
        req.user = null;
        return next();
      }

      console.log(`✅ [${getCurrentDateTime()}] User authenticated:`, {
        id: user.id,
        name: user.name,
        role: user.role
      });

      // Set full user data
      req.user = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      return next();

    } catch (tokenError) {
      // Invalid/expired token = continue as public user (no error thrown)
      console.log(`⚠️ [${getCurrentDateTime()}] Invalid/expired token - continuing as public:`, tokenError. message);
      req.user = null;
      return next();
    }

  } catch (error) {
    // Any other error = continue as public user
    console.error(`⚠️ [${getCurrentDateTime()}] optionalAuth error:`, error.message);
    req.user = null;
    return next();
  }
};

/**
 * ✅ REQUIRED AUTHENTICATION
 * Enforces that user must be authenticated
 * Returns 401 if no valid token
 * Use for PROTECTED routes (e.g., /articles/create)
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader. split(' ')[1];

    console.log(`🔐 [${getCurrentDateTime()}] authenticateToken - ${req.method} ${req.url}:`, {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      authHeaderPreview: authHeader ? authHeader.substring(0, 30) + '...' : 'none'
    });

    if (!token) {
      console.log(`❌ [${getCurrentDateTime()}] No token provided`);
      return res.status(401).json({
        success: false,
        message: 'Authentication required - no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log(`🔓 [${getCurrentDateTime()}] Token decoded:`, {
      userId: decoded.userId,
      email: decoded.email
    });

    // Fetch full user including role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        name: true,
        email: true,
        role: true
      }
    });

    if (! user) {
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

    // Set full user data
    req. user = {
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
      return res. status(403).json({
        success: false,
        message: 'Token expired - please login again'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * ✅ REQUIRE AUTHENTICATED USER
 * Must be used AFTER authenticateToken or optionalAuth
 * Checks that req.user exists
 */
export const requireAuth = (req, res, next) => {
  if (!req. user) {
    console.log(`❌ [${getCurrentDateTime()}] Auth required but no user`);
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  console.log(`✅ [${getCurrentDateTime()}] Auth check passed: ${req.user.name} (${req.user.role})`);
  next();
};

/**
 * ✅ REQUIRE SPECIFIC ROLE
 * Must be used AFTER authenticateToken + requireAuth
 * Checks that user has one of the allowed roles
 */
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
        userRole: req.user. role,
        requiredRoles: allowedRoles
      });
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    console.log(`✅ [${getCurrentDateTime()}] Role check passed: ${req. user.name} (${req. user.role})`);
    next();
  };
};