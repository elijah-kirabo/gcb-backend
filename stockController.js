const { Stock, Produce, Branch, User } = require('../models');

exports.getAllStock = async (req, res) => {
  try {
    const { branch_id, produce_id, low_stock } = req.query;
    const where = {};

    if (branch_id) where.branch_id = branch_id;
    if (produce_id) where.produce_id = produce_id;
    if (low_stock) where.quantity = { [Op.lt]: 10 };

    const stock = await Stock.findAll({
      where,
      include: [
        { model: Produce, as: 'produce' },
        { model: Branch, as: 'branch' },
        { model: User, as: 'updater', attributes: ['user_id', 'full_name'] }
      ],
      order: [['branch_id', 'ASC'], ['produce_id', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: stock.length,
      data: stock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { stock_id } = req.params;
    const { quantity } = req.body;

    const stock = await Stock.findByPk(stock_id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    stock.quantity = quantity;
    stock.updated_by = req.user.user_id;
    stock.last_updated = new Date();
    await stock.save();

    const updatedStock = await Stock.findByPk(stock_id, {
      include: [
        { model: Produce, as: 'produce' },
        { model: Branch, as: 'branch' }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};