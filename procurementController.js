const { Procurement, Produce, Dealer, Branch, User, Stock, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.createProcurement = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      produce_id,
      dealer_id,
      branch_id,
      tonnage,
      cost_per_ton,
      selling_price,
      date,
      time
    } = req.body;

    const total_cost = parseFloat(tonnage) * parseFloat(cost_per_ton);

    const procurement = await Procurement.create({
      produce_id,
      dealer_id,
      branch_id,
      recorded_by: req.user.user_id,
      tonnage,
      cost_per_ton,
      total_cost,
      selling_price,
      date,
      time
    }, { transaction });

    // Update stock
    const [stock, created] = await Stock.findOrCreate({
      where: { produce_id, branch_id },
      defaults: {
        quantity: tonnage,
        updated_by: req.user.user_id
      },
      transaction
    });

    if (!created) {
      stock.quantity = parseFloat(stock.quantity) + parseFloat(tonnage);
      stock.updated_by = req.user.user_id;
      stock.last_updated = new Date();
      await stock.save({ transaction });
    }

    await transaction.commit();

    const procurementWithDetails = await Procurement.findByPk(procurement.procurement_id, {
      include: [
        { model: Produce, as: 'produce' },
        { model: Dealer, as: 'dealer' },
        { model: Branch, as: 'branch' },
        { model: User, as: 'recorder', attributes: ['user_id', 'full_name'] }
      ]
    });

    res.status(201).json({
      success: true,
      data: procurementWithDetails
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllProcurements = async (req, res) => {
  try {
    const { branch_id, start_date, end_date, produce_id } = req.query;
    const where = {};

    if (branch_id) where.branch_id = branch_id;
    if (produce_id) where.produce_id = produce_id;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const procurements = await Procurement.findAll({
      where,
      include: [
        { model: Produce, as: 'produce' },
        { model: Dealer, as: 'dealer' },
        { model: Branch, as: 'branch' },
        { model: User, as: 'recorder', attributes: ['user_id', 'full_name'] }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: procurements.length,
      data: procurements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProcurement = async (req, res) => {
  try {
    const procurement = await Procurement.findByPk(req.params.id, {
      include: [
        { model: Produce, as: 'produce' },
        { model: Dealer, as: 'dealer' },
        { model: Branch, as: 'branch' },
        { model: User, as: 'recorder', attributes: ['user_id', 'full_name'] }
      ]
    });

    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: 'Procurement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: procurement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProcurement = async (req, res) => {
  try {
    const procurement = await Procurement.findByPk(req.params.id);

    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: 'Procurement not found'
      });
    }

    const updatedProcurement = await procurement.update(req.body);

    res.status(200).json({
      success: true,
      data: updatedProcurement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Continue in next artifact due to l