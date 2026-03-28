const mysql = require('mysql2/promise');
const dns = require('dns');
const net = require('net');

require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

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

function logEnvSummary() {
  console.log('=== DB ENV SUMMARY ===');
  console.log({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD_EXISTS: !!process.env.DB_PASSWORD,
    DB_CA_CERT_EXISTS: !!process.env.DB_CA_CERT
  });
}

async function testDns() {
  console.log('=== DNS TEST ===');
  try {
    const result = await dns.promises.lookup(process.env.DB_HOST, { all: true });
    console.log('DNS lookup success:', result);
  } catch (err) {
    console.error('DNS lookup failed:', err);
  }
}

async function testTcp() {
  console.log('=== TCP TEST ===');

  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(10000);

    socket.connect(Number(process.env.DB_PORT), process.env.DB_HOST, () => {
      console.log(`TCP connection succeeded to ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      socket.destroy();
      resolve();
    });

    socket.on('timeout', () => {
      console.error(`TCP connection timed out to ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      socket.destroy();
      resolve();
    });

    socket.on('error', (err) => {
      console.error('TCP connection failed:', err);
      resolve();
    });
  });
}

async function testDirectConnection() {
  console.log('=== DIRECT MYSQL TEST ===');

  let conn;

  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000,
      ssl: {
        ca: process.env.DB_CA_CERT
      }
    });

    console.log('Direct MySQL connection succeeded');

    const [rows] = await conn.query('SELECT DATABASE() AS db, NOW() AS server_time');
    console.log('Direct query success:', rows);
  } catch (err) {
    console.error('Direct MySQL connection failed:', err);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

async function testPool() {
  console.log('=== POOL TEST ===');

  try {
    const pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query('SELECT DATABASE() AS db');
    console.log('Pool query success:', rows);
    await pool.end();
  } catch (err) {
    console.error('Pool query failed:', err);
  }
}

async function runDiagnostics() {
  logEnvSummary();
  await testDns();
  await testTcp();
  await testDirectConnection();
  await testPool();
}

runDiagnostics();

const database = mysql.createPool(dbConfig);

module.exports = database;