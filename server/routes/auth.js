import { Router } from 'express';
import { getPool } from '../db/database.js';
import { createAdminToken, verifyPassword, verifyAdminToken } from '../services/admin-auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ erro: 'Utilizador e password são obrigatórios.' });
    }

    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, username, nome, password_salt, password_hash, ativo FROM admins WHERE username = ? LIMIT 1',
      [username.trim()]
    );
    const admin = rows[0];

    if (!admin || !admin.ativo) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const ok = verifyPassword(password, admin.password_salt, admin.password_hash);
    if (!ok) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = createAdminToken(admin);
    res.json({
      token,
      admin: { id: admin.id, username: admin.username, nome: admin.nome },
    });
  } catch (error) {
    console.error('Erro no login admin:', error);
    res.status(500).json({ erro: 'Erro ao autenticar admin.' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const payload = verifyAdminToken(token);
    if (!payload) return res.status(401).json({ erro: 'Não autenticado.' });

    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, username, nome, ativo FROM admins WHERE id = ? LIMIT 1',
      [payload.sub]
    );
    const admin = rows[0];
    if (!admin || !admin.ativo) return res.status(401).json({ erro: 'Sessão inválida.' });

    res.json({
      admin: { id: admin.id, username: admin.username, nome: admin.nome },
    });
  } catch (error) {
    console.error('Erro ao validar sessão admin:', error);
    res.status(500).json({ erro: 'Erro ao validar sessão.' });
  }
});

export default router;
