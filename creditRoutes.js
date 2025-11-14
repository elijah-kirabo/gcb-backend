const express = require('express');
const { body } = require('express-validator');
const {
  getAllCreditSales,
  recordPayment
} = require('../controllers/creditController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.get('/', getAllCreditSales);
router.post('/payment',
  authorize('Manager', 'SalesAgent'),
  [
    body('credit_id').isInt().withMessage('Credit ID must be an integer'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('payment_date').isDate().withMessage('Invalid date'),
    validate
  ],
  recordPayment
);

module.exports = router;