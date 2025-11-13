const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sales = sequelize.define('Sales', {
  sale_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  produce_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  procurement_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  buyer_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  buyer_contact: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  tonnage: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  amount_paid: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  sale_type: {
    type: DataTypes.ENUM('Cash', 'Credit'),
    defaultValue: 'Cash'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  receipt_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'sales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Sales;