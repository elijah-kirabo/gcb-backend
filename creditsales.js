const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CreditSales = sequelize.define('CreditSales', {
  credit_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sale_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  national_id: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  amount_due: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'PartiallyPaid', 'Paid'),
    defaultValue: 'Pending'
  }
}, {
  tableName: 'credit_sales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CreditSales;