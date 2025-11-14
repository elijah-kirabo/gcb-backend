const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dealer = sequelize.define('Dealer', {
  dealer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  contact: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  dealer_type: {
    type: DataTypes.ENUM('Individual', 'Company', 'Farm'),
    allowNull: false
  }
}, {
  tableName: 'dealers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Dealer;