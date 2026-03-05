import { Router } from 'express';
import { getPool } from '../db/database.js';
import { decrypt } from '../services/encryption.js';

const router = Router();

/**
 * POST /api/consulta - Consulta amigo secreto por token
 * Não revela informação de outros participantes
 */
router.post('/', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ erro: 'A chave/token é obrigatória.' });
    }

    const tokenTrimmed = token.trim();
    if (tokenTrimmed.length === 0) {
      return res.status(400).json({ erro: 'Introduza a sua chave de consulta.' });
    }

    const pool = getPool();

    const [resultados] = await pool.execute(
      `SELECT ps.participante_id, ps.resultado_encriptado, s.estado
       FROM participante_sorteio ps
       JOIN sorteios s ON ps.sorteio_id = s.id
       WHERE ps.token_consulta = ?`,
      [tokenTrimmed]
    );
    const resultado = resultados[0];

    if (!resultado) {
      return res.status(404).json({
        erro: 'Chave inválida ou expirada. Verifique se introduziu corretamente.',
      });
    }

    if (resultado.estado !== 'ativo') {
      return res.status(410).json({
        erro: 'Este sorteio já não está ativo.',
      });
    }

    const amigoSecretoId = decrypt(resultado.resultado_encriptado);

    const [amigos] = await pool.execute('SELECT nome FROM participantes WHERE id = ?', [
      amigoSecretoId,
    ]);
    const amigo = amigos[0];

    if (!amigo) {
      return res.status(500).json({ erro: 'Erro ao obter o resultado. Tente novamente.' });
    }

    res.json({
      amigoSecreto: amigo.nome,
    });
  } catch (error) {
    if (
      error.message?.includes('Dados encriptados inválidos') ||
      error.message?.includes('Unsupported state')
    ) {
      return res.status(404).json({
        erro: 'Chave inválida ou expirada. Verifique se introduziu corretamente.',
      });
    }
    console.error('Erro na consulta:', error);
    res.status(500).json({ erro: 'Ocorreu um erro. Tente novamente mais tarde.' });
  }
});

export default router;
