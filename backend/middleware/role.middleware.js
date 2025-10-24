import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

// Specific role middlewares for convenience
export const requireContentWriter = requireRole(['CONTENT_WRITER', 'CONTENT_LEAD', 'SUPER_ADMIN']);
export const requireContentLead = requireRole(['CONTENT_LEAD', 'SUPER_ADMIN']);
export const requireSuperAdmin = requireRole(['SUPER_ADMIN']);