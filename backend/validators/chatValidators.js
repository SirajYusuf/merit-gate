const { body, param, query } = require('express-validator');

const chatValidator = [
  body('message')
    .isString()
    .withMessage('Message must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 10000 })
    .withMessage('Message must be 10,000 characters or fewer'),
];

const historyValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
];

const chatLogDetailsValidator = [
  param('id')
    .isMongoId()
    .withMessage('Chat log id must be a valid MongoDB ObjectId'),
];

module.exports = {
  chatValidator,
  historyValidator,
  chatLogDetailsValidator,
};
