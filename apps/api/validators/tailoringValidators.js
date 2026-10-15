const { body, param, query } = require('express-validator');

const runTailoringValidator = [
  body('jobDescription')
    .isString()
    .withMessage('Job description must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ max: 50000 })
    .withMessage('Job description must be 50,000 characters or fewer'),
  body('projectIds')
    .optional()
    .isArray()
    .withMessage('projectIds must be an array'),
  body('projectIds.*')
    .optional()
    .isMongoId()
    .withMessage('Each project id must be a valid MongoDB ObjectId'),
  body('jobTitle')
    .optional()
    .isString()
    .withMessage('Job title must be a string')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Job title must be 200 characters or fewer'),
  body('companyName')
    .optional()
    .isString()
    .withMessage('Company name must be a string')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name must be 200 characters or fewer'),
  body('memoryType')
    .optional()
    .isIn(['strongest', 'ats', 'product_company', 'startup'])
    .withMessage('memoryType is invalid'),
  body('topK')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('topK must be an integer from 1 to 100')
    .toInt(),
  body('topN')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('topN must be an integer from 1 to 30')
    .toInt(),
];

const listTailoringRunsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

const tailoringRunIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Tailoring run id must be a valid MongoDB ObjectId'),
];

module.exports = {
  runTailoringValidator,
  listTailoringRunsValidator,
  tailoringRunIdValidator,
};
