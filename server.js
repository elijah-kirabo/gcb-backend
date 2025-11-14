const app = require('./app');
require('dotenv').config();
const sequelize = require('./database');
const PORT = process.env.PORT || 5000;

// Test database connection (Sequelize)
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully (Sequelize)');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Start server
app.listen(PORT, async () => {
  await testDatabaseConnection();
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
  } catch (err) {}
  console.log('🛑 Server shut down gracefully');
  process.exit(0);
});