const { Sales, Procurement, Stock, CreditSales, Produce, Branch, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    const { branch_id, start_date, end_date } = req.query;
    const where = {};
    
    if (branch_id) where.branch_id = branch_id;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    // Total sales
    const totalSales = await Sales.sum('amount_paid', { where });

    // Total procurement cost
    const totalProcurement = await Procurement.sum('total_cost', { where });

    // Profit
    const profit = totalSales - totalProcurement;

    // Number of transactions
    const salesCount = await Sales.count({ where });
    const procurementCount = await Procurement.count({ where });

    // Credit sales stats
    const creditStats = await CreditSales.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('credit_id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount_due')), 'total']
      ],
      group: ['status'],
      raw: true
    });

    // Low stock alerts
    const lowStock = await Stock.findAll({
      where: {
        quantity: { [Op.lt]: 10 },
        ...(branch_id && { branch_id })
      },
      include: [{ model: Produce, as: 'produce' }]
    });

    res.status(200).json({
      success: true,
      data: {
        totalSales: totalSales || 0,
        totalProcurement: totalProcurement || 0,
        profit: profit || 0,
        salesCount,
        procurementCount,
        creditStats,
        lowStockCount: lowStock.length,
        lowStock
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSalesTrends = async (req, res) => {
  try {
    const { branch_id, period = 'daily' } = req.query;
    
    let dateFormat;
    switch(period) {
      case 'monthly':
        dateFormat = '%Y-%m';
        break;
      case 'weekly':
        dateFormat = '%Y-%W';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const where = {};
    if (branch_id) where.branch_id = branch_id;

    const trends = await Sales.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('date'), dateFormat), 'period'],
        [sequelize.fn('SUM', sequelize.col('amount_paid')), 'total_sales'],
        [sequelize.fn('SUM', sequelize.col('tonnage')), 'total_tonnage'],
        [sequelize.fn('COUNT', sequelize.col('sale_id')), 'transaction_count']
      ],
      where,
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('date'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('date'), dateFormat), 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProducePerformance = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const where = {};
    if (branch_id) where.branch_id = branch_id;

    const performance = await Sales.findAll({
      attributes: [
        [sequelize.col('produce.name'), 'produce_name'],
        [sequelize.fn('SUM', sequelize.col('tonnage')), 'total_sold'],
        [sequelize.fn('SUM', sequelize.col('amount_paid')), 'total_revenue'],
        [sequelize.fn('COUNT', sequelize.col('sale_id')), 'sales_count']
      ],
      where,
      include: [
        { model: Produce, as: 'produce', attributes: [] }
      ],
      group: ['produce_id', 'produce.name'],
      order: [[sequelize.fn('SUM', sequelize.col('amount_paid')), 'DESC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};