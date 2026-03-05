#!/usr/bin/env node
/**
 * Script de configuração inicial do servidor
 * Cria o ficheiro .env com variáveis necessárias
 */
import { writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '.env');

if (existsSync(envPath)) {
  console.log('O ficheiro .env já existe. Nada a fazer.');
  process.exit(0);
}

const key = crypto.randomBytes(32).toString('hex');
const envContent = `# Gerado automaticamente por setup.js
ENCRYPTION_KEY=${key}
PORT=3000
CORS_ORIGIN=http://localhost:4200

# MySQL - ajuste conforme o seu ambiente
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=amigo_secreto
`;

writeFileSync(envPath, envContent);
console.log('Ficheiro .env criado.');
console.log('Configure MYSQL_PASSWORD e outras variáveis MYSQL_* conforme necessário.');
console.log('Depois execute: npm run init-db e npm start');
