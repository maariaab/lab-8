const mysql = require('mysql2/promise');
const dns = require('dns');

require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

const dbConfig = {
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT || 3306),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	multipleStatements: false,
	namedPlaceholders: true,

	
	connectTimeout: 10000,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,

	ssl: {}
};

const database = mysql.createPool(dbConfig);

module.exports = database;