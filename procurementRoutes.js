const express = require('express');
const { body } = require('express-validator');
const {
  createProcurement,
  getAllProcurements,
  getProcurement,
  updateProcurement
} = require('../controllers/procurementController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.post('/',
  authorize('Manager', 'SalesAgent'),
  [
    body('produce_id').isInt().withMessage('Produce ID must be an integer'),
    body('dealer_id').isInt().withMessage('Dealer ID must be an integer'),
    body('branch_id').isInt().withMessage('Branch ID must be an integer'),
    body('tonnage').isFloat({ min: 1 }).withMessage('Tonnage must be at least 1'),
    body('cost_per_ton').isFloat({ min: 0 }).withMessage('Cost per ton must be positive'),
    body('selling_price').isFloat({ min: 0 }).withMessage('Selling price must be positive'),
    body('date').isDate().withMessage('Invalid date'),
    body('time').matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).withMessage('Invalid time format'),
    validate
  ],
  createProcurement
);

router.get('/', getAllProcurements);
router.get('/:id', getProcurement);
router.put('/:id', authorize('Manager', 'CEO'), updateProcurement);

module.exports = router;
