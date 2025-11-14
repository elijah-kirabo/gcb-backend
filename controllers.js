const { CreditSales, Sales, Payment, Produce, Branch, User, sequelize } = require('../models');

exports.getAllCreditSales = async (req, res) => {
  try {
    const { status, branch_id, overdue } = req.query;
    const where = {};

    if (status) where.status = status;

    if (overdue === 'true') {
      where.due_date = { [Op.lt]: new Date() };
      where.status = { [Op.ne]: 'Paid' };
    }

    const creditSales = await CreditSales.findAll({
      where,
      include: [
        {
          model: Sales,
          as: 'sale',
          include: [
            { model: Produce, as: 'produce' },
            { model: Branch, as: 'branch', where: branch_id ? { branch_id } : {} },
            { model: User, as: 'agent', attributes: ['user_id', 'full_name'] }
          ]
        },
        { model: Payment, as: 'payments' }
      ],
      order: [['due_date', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: creditSales.length,
      data: creditSales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.recordPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { credit_id, amount, payment_date } = req.body;

    const credit = await CreditSales.findByPk(credit_id, {
      include: [{ model: Payment, as: 'payments' }]
    });

    if (!credit) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Credit sale not found'
      });
    }

    // Calculate total paid
    const totalPaid = credit.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) + parseFloat(amount);

    // Create payment
    await Payment.create({
      credit_id,
      amount,
      payment_date,
      recorded_by: req.user.user_id
    }, { transaction });

    // Update credit status
    if (totalPaid >= parseFloat(credit.amount_due)) {
      credit.status = 'Paid';
    } else if (totalPaid > 0) {
      credit.status = 'PartiallyPaid';
    }
    await credit.save({ transaction });

    await transaction.commit();

    const updatedCredit = await CreditSales.findByPk(credit_id, {
      include: [
        { model: Sales, as: 'sale' },
        { model: Payment, as: 'payments' }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedCredit
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};