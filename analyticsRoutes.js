const express = require('express');
const {
  getDashboardStats,
  getSalesTrends,
  getProducePerformance
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Manager', 'CEO'));

router.get('/dashboard', getDashboardStats);
router.get('/trends', getSalesTrends);
router.get('/produce-performance', getProducePerformance);

module.exports = router;