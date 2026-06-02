const { body, param } = require('express-validator');

const createProjectValidator = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be 200 characters or fewer'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be 2,000 characters or fewer'),
];

const projectIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Project id must be a valid MongoDB ObjectId'),
];

const ingestProjectValidator = [
  param('id')
    .isMongoId()
    .withMessage('Project id must be a valid MongoDB ObjectId'),
  body()
    .custom((value) => {
      const rawText = value.rawText || value.text;
      const fileName = value.fileName;

      return (
        (typeof rawText === 'string' && rawText.trim().length > 0) ||
        (typeof fileName === 'string' && fileName.trim().length > 0)
      );
    })
    .withMessage('rawText or fileName is required'),
  body('rawText')
    .optional()
    .isString()
    .withMessage('rawText must be a string')
    .isLength({ max: 50000 })
    .withMessage('rawText must be 50,000 characters or fewer'),
  body('text')
    .optional()
    .isString()
    .withMessage('text must be a string')
    .isLength({ max: 50000 })
    .withMessage('text must be 50,000 characters or fewer'),
  body('fileName')
    .optional()
    .isString()
    .withMessage('fileName must be a string')
    .trim()
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(md|markdown|txt)$/i)
    .withMessage('fileName must be a valid uploaded .md, .markdown, or .txt file name'),
];

module.exports = {
  createProjectValidator,
  projectIdValidator,
  ingestProjectValidator,
};
