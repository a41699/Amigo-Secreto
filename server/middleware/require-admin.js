import { verifyAdminToken } from '../services/admin-auth.js';
import { getPool } from '../db/database.js';

export async function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const payload = verifyAdminToken(token);

    if (!payload) {
      return res.status(401).json({ erro: 'Não autenticado.' });
    }

    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, username, nome, ativo FROM admins WHERE id = ? LIMIT 1',
      [payload.sub]
    );
    const admin = rows[0];

    if (!admin || !admin.ativo || admin.username !== payload.usr) {
      return res.status(401).json({ erro: 'Sessão inválida.' });
    }

    req.admin = {
      id: admin.id,
      username: admin.username,
      nome: admin.nome,
    };
    next();
  } catch (error) {
    console.error('Erro na autenticação admin:', error);
    res.status(500).json({ erro: 'Erro ao validar autenticação.' });
  }
}
