#!/usr/bin/env node
/**
 * Script para inicializar a base de dados MySQL
 * Cria a base de dados e as tabelas
 * Executar: npm run init-db
 */
import { initDatabase } from './database.js';

console.log('A conectar ao MySQL e a criar tabelas...');
try {
  await initDatabase();
  console.log('Base de dados inicializada com sucesso.');
} catch (error) {
  console.error('Erro:', error.message);
  process.exit(1);
}
