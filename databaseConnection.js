const mysql = require('mysql2/promise');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

async function testDb() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000,
      ssl: {}
    });

    const [rows] = await conn.query('SELECT DATABASE() AS db');
    console.log('DB TEST OK:', rows);
    await conn.end();
  } catch (err) {
    console.error('DB TEST FAILED:', err);
  }
}

testDb();

console.log('DB target:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER
});

const dbConfig = {
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	multipleStatements: false,
	namedPlaceholders: true,
	connectTimeout: 10000,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	ssl: {
		ca: process.env.DB_CA_CERT
	}
};

const database = mysql.createPool(dbConfig);

module.exports = database;