const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produce = sequelize.define('Produce', {
  produce_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: 'tons'
  }
}, {
  tableName: 'produce',
  timestamps: false
});

module.exports = Produce;
