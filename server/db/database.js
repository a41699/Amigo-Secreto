import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from '../services/admin-auth.js';
import { generateId } from '../services/encryption.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let pool = null;

async function ensureDefaultAdmin(poolRef) {
  const [rows] = await poolRef.execute('SELECT id FROM admins LIMIT 1');
  if (rows.length > 0) return;

  const username = (process.env.ADMIN_USER || 'admin').trim();
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const nome = process.env.ADMIN_NAME || 'Administrador';
  const agora = new Date().toISOString();
  const { salt, hash } = hashPassword(password);

  await poolRef.execute(
    `INSERT INTO admins (id, username, nome, password_salt, password_hash, ativo, data_criacao, data_atualizacao)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    [generateId(), username, nome, salt, hash, agora, agora]
  );

  console.log(`Admin inicial criado: utilizador "${username}"`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log('Password inicial: "admin123". Altere ADMIN_PASSWORD no .env em produção.');
  }
}

function getConfig() {
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'amigo_secreto',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

/**
 * Cria a base de dados se não existir
 */
async function ensureDatabase() {
  const config = getConfig();
  const dbName = config.database;
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });
  await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.end();
}

/**
 * Inicializa a conexão com o MySQL e executa migrações
 */
export async function initDatabase() {
  if (pool) return pool;

  const config = getConfig();
  await ensureDatabase();
  pool = mysql.createPool(config);

  const migration = readFileSync(join(__dirname, '001_initial.sql'), 'utf-8');
  const statements = migration
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.toLowerCase().includes('create'));

  for (const statement of statements) {
    if (statement.trim()) {
      await pool.execute(statement);
    }
  }

  await ensureDefaultAdmin(pool);

  return pool;
}

/**
 * Obtém o pool de conexões (deve chamar initDatabase antes)
 */
export function getPool() {
  if (!pool) {
    throw new Error('Base de dados não inicializada. Chame initDatabase() primeiro.');
  }
  return pool;
}
