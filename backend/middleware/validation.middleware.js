/**
 * Validation Middleware for ParentCircle API
 * 
 * This middleware validates request data BEFORE it reaches controllers.
 * No controller code changes needed - just add to routes!
 * 
 * @author ArogoClin
 * @date 2025-11-16
 */

// ============================================
// VALIDATION HELPER FUNCTIONS
// ============================================

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim();
};

/**
 * Check if value is a positive integer
 */
const isPositiveInteger = (value) => {
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

// ============================================
// GENERIC VALIDATION MIDDLEWARE
// ============================================

/**
 * Validate required fields in request body
 * @param {Array<string>} fields - Required field names
 */
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = [];

    for (const field of fields) {
      const value = req.body[field];
      
      if (value === undefined || value === null || value === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
        missingFields: missing
      });
    }

    next();
  };
};

/**
 * Validate field types
 */
export const validateTypes = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, expectedType] of Object.entries(schema)) {
      const value = req.body[field];

      // Skip if field is not present (use validateRequired for required fields)
      if (value === undefined || value === null) continue;

      switch (expectedType) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
          }
          break;

        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`${field} must be a number`);
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${field} must be a boolean`);
          }
          break;

        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${field} must be an array`);
          }
          break;

        case 'email':
          if (typeof value !== 'string' || !isValidEmail(value)) {
            errors.push(`${field} must be a valid email address`);
          }
          break;

        case 'url':
          if (typeof value !== 'string' || !isValidUrl(value)) {
            errors.push(`${field} must be a valid URL`);
          }
          break;

        case 'positiveInteger':
          if (!isPositiveInteger(value)) {
            errors.push(`${field} must be a positive integer`);
          }
          break;

        default:
          break;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

/**
 * Validate string length constraints
 */
export const validateLength = (constraints) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, { min, max }] of Object.entries(constraints)) {
      const value = req.body[field];

      // Skip if field is not present
      if (!value) continue;

      if (typeof value !== 'string') {
        errors.push(`${field} must be a string`);
        continue;
      }

      const length = value.trim().length;

      if (min !== undefined && length < min) {
        errors.push(`${field} must be at least ${min} characters long`);
      }

      if (max !== undefined && length > max) {
        errors.push(`${field} must not exceed ${max} characters`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

/**
 * Validate enum values
 */
export const validateEnum = (field, allowedValues) => {
  return (req, res, next) => {
    const value = req.body[field] || req.query[field];

    // Skip if field is not present
    if (!value) return next();

    if (!allowedValues.includes(value)) {
      return res.status(400).json({
        success: false,
        message: `${field} must be one of: ${allowedValues.join(', ')}`,
        received: value
      });
    }

    next();
  };
};

// ============================================
// PARENTCIRCLE-SPECIFIC VALIDATORS
// ============================================

/**
 * Validate category creation/update
 */
export const validateCategory = [
  validateRequired(['name', 'type']),
  validateTypes({
    name: 'string',
    description: 'string',
    type: 'string',
    icon: 'string',
    color: 'string',
    order: 'number',
    isActive: 'boolean'
  }),
  validateLength({
    name: { min: 2, max: 100 },
    description: { max: 500 }
  }),
  validateEnum('type', ['QUESTION', 'STORY', 'BOTH'])
];

/**
 * Validate question creation
 */
export const validateQuestionCreate = [
  validateRequired(['content', 'categoryId']),
  validateTypes({
    title: 'string',
    content: 'string',
    categoryId: 'positiveInteger',
    tags: 'array',
    isAnonymous: 'boolean',
    authorName: 'string'
  }),
  validateLength({
    title: { min: 5, max: 200 },
    content: { min: 10, max: 5000 },
    authorName: { min: 2, max: 50 }
  })
];

/**
 * Validate question update
 */
export const validateQuestionUpdate = [
  validateTypes({
    title: 'string',
    content: 'string',
    categoryId: 'positiveInteger',
    tags: 'array'
  }),
  validateLength({
    title: { min: 5, max: 200 },
    content: { min: 10, max: 5000 }
  })
];

/**
 * Validate answer creation
 */
export const validateAnswerCreate = [
  validateRequired(['content']),
  validateTypes({
    content: 'string'
  }),
  validateLength({
    content: { min: 10, max: 10000 }
  })
];

/**
 * Validate answer update
 */
export const validateAnswerUpdate = [
  validateTypes({
    content: 'string',
    isVerified: 'boolean',
    isAccepted: 'boolean'
  }),
  validateLength({
    content: { min: 10, max: 10000 }
  })
];

/**
 * Validate story creation
 */
export const validateStoryCreate = [
  validateRequired(['content']),
  validateTypes({
    title: 'string',
    content: 'string',
    categoryId: 'positiveInteger',
    tags: 'array',
    isAnonymous: 'boolean',
    authorName: 'string'
  }),
  validateLength({
    title: { min: 5, max: 200 },
    content: { min: 20, max: 10000 },
    authorName: { min: 2, max: 50 }
  })
];

/**
 * Validate story update
 */
export const validateStoryUpdate = [
  validateTypes({
    title: 'string',
    content: 'string',
    categoryId: 'positiveInteger',
    tags: 'array'
  }),
  validateLength({
    title: { min: 5, max: 200 },
    content: { min: 20, max: 10000 }
  })
];

/**
 * Validate vote (question)
 */
export const validateQuestionVote = [
  validateRequired(['isHelpful']),
  validateTypes({
    isHelpful: 'boolean'
  })
];

/**
 * Validate moderation actions
 */
export const validateModerationApprove = [
  validateRequired(['contentType', 'contentId']),
  validateTypes({
    contentType: 'string',
    contentId: 'positiveInteger',
    notes: 'string'
  }),
  validateEnum('contentType', ['QUESTION', 'STORY'])
];

export const validateModerationReject = [
  validateRequired(['contentType', 'contentId', 'reason']),
  validateTypes({
    contentType: 'string',
    contentId: 'positiveInteger',
    reason: 'string',
    notes: 'string'
  }),
  validateLength({
    reason: { min: 10, max: 500 },
    notes: { max: 1000 }
  }),
  validateEnum('contentType', ['QUESTION', 'STORY'])
];

export const validateModerationArchive = [
  validateRequired(['contentType', 'contentId']),
  validateTypes({
    contentType: 'string',
    contentId: 'positiveInteger',
    reason: 'string'
  }),
  validateEnum('contentType', ['QUESTION', 'STORY'])
];

export const validateBulkApprove = [
  validateRequired(['items']),
  validateTypes({
    items: 'array'
  }),
  (req, res, next) => {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'items must be a non-empty array'
      });
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.contentType || !item.contentId) {
        return res.status(400).json({
          success: false,
          message: `Item at index ${i} is missing contentType or contentId`
        });
      }

      if (!['QUESTION', 'STORY'].includes(item.contentType)) {
        return res.status(400).json({
          success: false,
          message: `Item at index ${i} has invalid contentType: ${item.contentType}`
        });
      }

      if (!isPositiveInteger(item.contentId)) {
        return res.status(400).json({
          success: false,
          message: `Item at index ${i} has invalid contentId`
        });
      }
    }

    next();
  }
];

/**
 * Validate pagination parameters
 */
export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'page must be a positive integer'
      });
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'limit must be between 1 and 100'
      });
    }
  }

  next();
};

/**
 * Validate ID parameter in URL
 */
export const validateIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];

    // Check if it's numeric (for ID) - allow slug for identifier
    if (paramName === 'identifier') {
      // Allow both numeric IDs and string slugs
      return next();
    }

    if (!isPositiveInteger(id)) {
      return res.status(400).json({
        success: false,
        message: `${paramName} must be a valid positive integer`,
        received: id
      });
    }

    next();
  };
};

// ============================================
// SANITIZATION MIDDLEWARE
// ============================================

/**
 * Sanitize request body fields
 * Trims whitespace from string fields
 */
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        req.body[key] = sanitizeString(value);
      } else if (Array.isArray(value)) {
        req.body[key] = value.map(item => 
          typeof item === 'string' ? sanitizeString(item) : item
        );
      }
    }
  }
  next();
};

/**
 * Validate and sanitize tags array
 */
export const validateTags = (req, res, next) => {
  const { tags } = req.body;

  if (!tags) return next();

  if (!Array.isArray(tags)) {
    return res.status(400).json({
      success: false,
      message: 'tags must be an array'
    });
  }

  // Validate each tag
  const validTags = tags.filter(tag => {
    if (typeof tag !== 'string') return false;
    const trimmed = tag.trim();
    return trimmed.length >= 2 && trimmed.length <= 30;
  });

  if (validTags.length !== tags.length) {
    return res.status(400).json({
      success: false,
      message: 'Each tag must be a string between 2-30 characters'
    });
  }

  // Limit to 10 tags maximum
  if (validTags.length > 10) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 10 tags allowed'
    });
  }

  // Update with sanitized tags
  req.body.tags = validTags.map(tag => tag.trim());
  next();
};

// ============================================
// COMBINED VALIDATORS (Ready to Use)
// ============================================

/**
 * Complete validation chain for creating a question
 */
export const validateCreateQuestion = [
  sanitizeBody,
  ...validateQuestionCreate,
  validateTags
];

/**
 * Complete validation chain for updating a question
 */
export const validateUpdateQuestion = [
  sanitizeBody,
  validateIdParam('id'),
  ...validateQuestionUpdate,
  validateTags
];

/**
 * Complete validation chain for creating a story
 */
export const validateCreateStory = [
  sanitizeBody,
  ...validateStoryCreate,
  validateTags
];

/**
 * Complete validation chain for updating a story
 */
export const validateUpdateStory = [
  sanitizeBody,
  validateIdParam('id'),
  ...validateStoryUpdate,
  validateTags
];

/**
 * Complete validation chain for creating an answer
 */
export const validateCreateAnswer = [
  sanitizeBody,
  validateIdParam('questionId'),
  ...validateAnswerCreate
];

/**
 * Complete validation chain for updating an answer
 */
export const validateUpdateAnswer = [
  sanitizeBody,
  validateIdParam('id'),
  ...validateAnswerUpdate
];

/**
 * Complete validation chain for creating a category
 */
export const validateCreateCategory = [
  sanitizeBody,
  ...validateCategory
];

/**
 * Complete validation chain for updating a category
 */
export const validateUpdateCategory = [
  sanitizeBody,
  validateIdParam('id'),
  validateTypes({
    name: 'string',
    description: 'string',
    type: 'string',
    icon: 'string',
    color: 'string',
    order: 'number',
    isActive: 'boolean'
  }),
  validateLength({
    name: { min: 2, max: 100 },
    description: { max: 500 }
  })
];