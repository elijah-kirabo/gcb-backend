import sequelize from '../config/database';
import User from './user';
import Branch from './branch';
import Produce from './produce';
import Dealer from './dealer';
import Procurement from './procurement';
import Sales from './sales';
import CreditSales from './creditsales';
import Payment from './payment';
import Stock from './stock';

// Define relationships
User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Branch.hasMany(User, { foreignKey: 'branch_id', as: 'users' });
Branch.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });

Procurement.belongsTo(Produce, { foreignKey: 'produce_id', as: 'produce' });
Procurement.belongsTo(Dealer, { foreignKey: 'dealer_id', as: 'dealer' });
Procurement.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Procurement.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

Sales.belongsTo(Produce, { foreignKey: 'produce_id', as: 'produce' });
Sales.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Sales.belongsTo(User, { foreignKey: 'agent_id', as: 'agent' });
Sales.belongsTo(Procurement, { foreignKey: 'procurement_id', as: 'procurement' });

CreditSales.belongsTo(Sales, { foreignKey: 'sale_id', as: 'sale' });
Sales.hasOne(CreditSales, { foreignKey: 'sale_id', as: 'credit' });

Payment.belongsTo(CreditSales, { foreignKey: 'credit_id', as: 'credit' });
Payment.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });
CreditSales.hasMany(Payment, { foreignKey: 'credit_id', as: 'payments' });

Stock.belongsTo(Produce, { foreignKey: 'produce_id', as: 'produce' });
Stock.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Stock.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

export {
  sequelize,
  User,
  Branch,
  Produce,
  Dealer,
  Procurement,
  Sales,
  CreditSales,
  Payment,
  Stock
};