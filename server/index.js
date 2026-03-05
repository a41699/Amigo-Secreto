import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/database.js';
import participantesRouter from './routes/participantes.js';
import sorteioRouter from './routes/sorteio.js';
import consultaRouter from './routes/consulta.js';

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';

// Validar configuração ao arrancar
if (!process.env.ENCRYPTION_KEY) {
  console.error('');
  console.error('ERRO: A variável ENCRYPTION_KEY não está definida.');
  console.error('Crie um ficheiro .env na pasta server/ com:');
  console.error('  ENCRYPTION_KEY=<chave_hex_64_caracteres>');
  console.error('  MYSQL_HOST=localhost');
  console.error('  MYSQL_USER=root');
  console.error('  MYSQL_PASSWORD=sua_password');
  console.error('  MYSQL_DATABASE=amigo_secreto');
  console.error('');
  process.exit(1);
}

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use('/api/participantes', participantesRouter);
app.use('/api/sorteio', sorteioRouter);
app.use('/api/consulta', consultaRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', versao: '1.0.0' });
});

app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor Amigo Secreto a correr em http://localhost:${PORT}`);
      console.log(`API disponível em http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Erro ao conectar à base de dados MySQL:', error.message);
    console.error('Verifique se o MySQL está a correr e as variáveis MYSQL_* no .env');
    process.exit(1);
  }
}

start();
