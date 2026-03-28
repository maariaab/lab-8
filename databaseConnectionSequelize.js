const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      ssl: {
        ca: process.env.DB_CA_CERT
      }
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Sequelize connected successfully');
  })
  .catch((err) => {
    console.error('Sequelize connection failed:', err);
  });

module.exports = sequelize;