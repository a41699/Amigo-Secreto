import { Router } from 'express';
import { getPool } from '../db/database.js';
import { generateId } from '../services/encryption.js';
import { gerarEmparelhamento, prepararParaPersistencia } from '../services/sorteio-logic.js';

const router = Router();
const MIN_PARTICIPANTES = 3;

/**
 * GET /api/sorteio - Lista sorteios existentes
 */
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [sorteios] = await pool.execute(
      `SELECT id, data_sorteio, estado, data_criacao 
       FROM sorteios 
       ORDER BY data_criacao DESC`
    );

    res.json(
      sorteios.map((s) => ({
        id: s.id,
        dataSorteio: s.data_sorteio,
        estado: s.estado,
        dataCriacao: s.data_criacao,
      }))
    );
  } catch (error) {
    console.error('Erro ao listar sorteios:', error);
    res.status(500).json({ erro: 'Erro ao obter sorteios.' });
  }
});

/**
 * POST /api/sorteio - Gera novo sorteio
 */
router.post('/', async (req, res) => {
  try {
    const pool = getPool();

    const [participantesRows] = await pool.execute(
      `SELECT id, nome FROM participantes WHERE ativo = 1 ORDER BY nome`
    );
    const participantesAtivos = participantesRows;

    if (participantesAtivos.length < MIN_PARTICIPANTES) {
      return res.status(400).json({
        erro: `São necessários pelo menos ${MIN_PARTICIPANTES} participantes ativos para realizar o sorteio.`,
      });
    }

    const [sorteioAtivoRows] = await pool.execute(
      "SELECT id FROM sorteios WHERE estado = 'ativo' LIMIT 1"
    );
    if (sorteioAtivoRows[0]) {
      return res.status(400).json({
        erro: 'Já existe um sorteio ativo. Inative o sorteio anterior antes de criar um novo.',
      });
    }

    const emparelhamento = gerarEmparelhamento(participantesAtivos);

    const sorteioId = generateId();
    const agora = new Date().toISOString();

    await pool.execute(
      `INSERT INTO sorteios (id, data_sorteio, estado, data_criacao) VALUES (?, ?, 'ativo', ?)`,
      [sorteioId, agora, agora]
    );

    const participantesParaGuardar = prepararParaPersistencia(emparelhamento, sorteioId);

    for (const row of participantesParaGuardar) {
      await pool.execute(
        `INSERT INTO participante_sorteio (id, sorteio_id, participante_id, resultado_encriptado, token_consulta, data_criacao)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.sorteioId,
          row.participanteId,
          row.resultadoEncriptado,
          row.tokenConsulta,
          agora,
        ]
      );
    }

    const tokens = participantesParaGuardar.map((row) => {
      const participante = participantesAtivos.find((p) => p.id === row.participanteId);
      return { participanteNome: participante?.nome, token: row.tokenConsulta };
    });

    res.status(201).json({
      id: sorteioId,
      dataSorteio: agora,
      estado: 'ativo',
      mensagem: `Sorteio gerado com sucesso. ${participantesAtivos.length} participantes.`,
      tokens,
    });
  } catch (error) {
    console.error('Erro ao gerar sorteio:', error);
    res.status(500).json({ erro: 'Erro ao gerar sorteio. Tente novamente.' });
  }
});

/**
 * GET /api/sorteio/ativos - Verifica se há sorteio ativo
 */
router.get('/ativos', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT id FROM sorteios WHERE estado = 'ativo' LIMIT 1");
    res.json({ temSorteioAtivo: rows.length > 0 });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao verificar sorteio.' });
  }
});

/**
 * PATCH /api/sorteio/:id/inativar - Inativa um sorteio (permite criar novo)
 */
router.patch('/:id/inativar', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [resultado] = await pool.execute(
      "UPDATE sorteios SET estado = 'inativo' WHERE id = ? AND estado = 'ativo'",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Sorteio não encontrado ou já inativo.' });
    }

    res.json({ mensagem: 'Sorteio inativado com sucesso.' });
  } catch (error) {
    console.error('Erro ao inativar sorteio:', error);
    res.status(500).json({ erro: 'Erro ao inativar sorteio.' });
  }
});

/**
 * DELETE /api/sorteio/:id - Remove um sorteio e os respetivos registos associados
 */
router.delete('/:id', async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const pool = getPool();
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [sorteioRows] = await conn.execute('SELECT id FROM sorteios WHERE id = ? LIMIT 1', [id]);
    if (!sorteioRows[0]) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Sorteio não encontrado.' });
    }

    // Remove primeiro os registos dependentes para funcionar mesmo em BDs sem ON DELETE CASCADE.
    try {
      await conn.execute('DELETE FROM participante_sorteio WHERE sorteio_id = ?', [id]);
    } catch (error) {
      // Compatibilidade com schemas antigos que usavam camelCase.
      if (error?.code !== 'ER_BAD_FIELD_ERROR') {
        throw error;
      }
      await conn.execute('DELETE FROM participante_sorteio WHERE sorteioId = ?', [id]);
    }

    const [resultado] = await conn.execute('DELETE FROM sorteios WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Sorteio não encontrado.' });
    }

    await conn.commit();
    res.json({ mensagem: 'Sorteio removido com sucesso.' });
  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {}
    }
    console.error('Erro ao remover sorteio:', error);
    res.status(500).json({ erro: 'Erro ao remover sorteio.' });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
