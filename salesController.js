const { Sales, CreditSales, Produce, Branch, User, Stock, sequelize } = require('../models');
const { Op } = require('sequelize');

// Generate unique receipt number
const generateReceiptNo = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const prefix = `RCP-${year}${month}${day}`;
  const lastSale = await Sales.findOne({
    where: {
      receipt_no: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['receipt_no', 'DESC']]
  });

  let sequence = 1;
  if (lastSale) {
    const lastSeq = parseInt(lastSale.receipt_no.split('-').pop());
    sequence = lastSeq + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

exports.createSale = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      produce_id,
      branch_id,
      buyer_name,
      buyer_contact,
      tonnage,
      amount_paid,
      sale_type,
      date,
      time,
      credit_details
    } = req.body;

    // Check stock availability
    const stock = await Stock.findOne({
      where: { produce_id, branch_id }
    });

    if (!stock || parseFloat(stock.quantity) < parseFloat(tonnage)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Generate receipt number
    const receipt_no = await generateReceiptNo();

    // Create sale
    const sale = await Sales.create({
      produce_id,
      branch_id,
      agent_id: req.user.user_id,
      buyer_name,
      buyer_contact,
      tonnage,
      amount_paid,
      sale_type,
      date,
      time,
      receipt_no
    }, { transaction });

    // Update stock
    stock.quantity = parseFloat(stock.quantity) - parseFloat(tonnage);
    stock.updated_by = req.user.user_id;
    stock.last_updated = new Date();
    await stock.save({ transaction });

    // If credit sale, create credit record
    if (sale_type === 'Credit' && credit_details) {
      await CreditSales.create({
        sale_id: sale.sale_id,
        national_id: credit_details.national_id,
        location: credit_details.location,
        amount_due: credit_details.amount_due,
        due_date: credit_details.due_date,
        status: 'Pending'
      }, { transaction });
    }

    await transaction.commit();

    const saleWithDetails = await Sales.findByPk(sale.sale_id, {
      include: [
        { model: Produce, as: 'produce' },
        { model: Branch, as: 'branch' },
        { model: User, as: 'agent', attributes: ['user_id', 'full_name'] },
        { model: CreditSales, as: 'credit' }
      ]
    });

    res.status(201).json({
      success: true,
      data: saleWithDetails
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const { branch_id, start_date, end_date, sale_type, produce_id } = req.query;
    const where = {};

    if (branch_id) where.branch_id = branch_id;
    if (sale_type) where.sale_type = sale_type;
    if (produce_id) where.produce_id = produce_id;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const sales = await Sales.findAll({
      where,
      include: [
        { model: Produce, as: 'produce' },
        { model: Branch, as: 'branch' },
        { model: User, as: 'agent', attributes: ['user_id', 'full_name'] },
        { model: CreditSales, as: 'credit' }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSale = async (req, res) => {
  try {
    const sale = await Sales.findByPk(req.params.id, {
      include: [
        { model: Produce, as: 'produce' },
        { model: Branch, as: 'branch' },
        { model: User, as: 'agent', attributes: ['user_id', 'full_name'] },
        { model: CreditSales, as: 'credit' }
      ]
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};