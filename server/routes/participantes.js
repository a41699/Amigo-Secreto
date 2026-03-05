import { Router } from 'express';
import { getPool } from '../db/database.js';
import { generateId } from '../services/encryption.js';

const router = Router();

/**
 * GET /api/participantes - Lista todos os participantes
 */
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [participantes] = await pool.execute(
      `SELECT id, nome, ativo, data_criacao, data_atualizacao 
       FROM participantes 
       ORDER BY data_criacao DESC`
    );

    res.json(
      participantes.map((p) => ({
        id: p.id,
        nome: p.nome,
        ativo: Boolean(p.ativo),
        dataCriacao: p.data_criacao,
        dataAtualizacao: p.data_atualizacao,
      }))
    );
  } catch (error) {
    console.error('Erro ao listar participantes:', error);
    res.status(500).json({ erro: 'Erro ao obter participantes.' });
  }
});

/**
 * POST /api/participantes - Regista novo participante
 */
router.post('/', async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || typeof nome !== 'string') {
      return res.status(400).json({ erro: 'O nome é obrigatório.' });
    }

    const nomeTrimmed = nome.trim();
    if (nomeTrimmed.length === 0) {
      return res.status(400).json({ erro: 'O nome não pode estar vazio.' });
    }

    const pool = getPool();
    const id = generateId();
    const agora = new Date().toISOString();

    await pool.execute(
      `INSERT INTO participantes (id, nome, ativo, data_criacao, data_atualizacao)
       VALUES (?, ?, 1, ?, ?)`,
      [id, nomeTrimmed, agora, agora]
    );

    res.status(201).json({
      id,
      nome: nomeTrimmed,
      ativo: true,
      dataCriacao: agora,
      dataAtualizacao: agora,
    });
  } catch (error) {
    console.error('Erro ao criar participante:', error);
    let msg = 'Erro ao registar participante.';
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      msg = 'Não foi possível conectar ao MySQL. Verifique se está a correr.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      msg = 'Erro de acesso ao MySQL. Verifique o utilizador e password no .env';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      msg = 'Base de dados não encontrada. Crie a base "amigo_secreto" no MySQL.';
    } else if (error.sqlMessage) {
      msg = `Erro MySQL: ${error.sqlMessage}`;
    }
    res.status(500).json({ erro: msg });
  }
});

/**
 * PUT /api/participantes/:id - Edita participante
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, ativo } = req.body;

    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, nome, ativo FROM participantes WHERE id = ?',
      [id]
    );
    const existente = rows[0];

    if (!existente) {
      return res.status(404).json({ erro: 'Participante não encontrado.' });
    }

    const agora = new Date().toISOString();
    let nomeFinal = existente.nome;
    let ativoFinal = existente.ativo;

    if (nome !== undefined) {
      const nomeTrimmed = typeof nome === 'string' ? nome.trim() : '';
      if (nomeTrimmed.length === 0) {
        return res.status(400).json({ erro: 'O nome não pode estar vazio.' });
      }
      nomeFinal = nomeTrimmed;
    }

    if (ativo !== undefined) {
      ativoFinal = ativo ? 1 : 0;
    }

    await pool.execute(
      `UPDATE participantes SET nome = ?, ativo = ?, data_atualizacao = ? WHERE id = ?`,
      [nomeFinal, ativoFinal, agora, id]
    );

    const [atualizados] = await pool.execute('SELECT * FROM participantes WHERE id = ?', [id]);
    const atualizado = atualizados[0];
    res.json({
      id: atualizado.id,
      nome: atualizado.nome,
      ativo: Boolean(atualizado.ativo),
      dataCriacao: atualizado.data_criacao,
      dataAtualizacao: atualizado.data_atualizacao,
    });
  } catch (error) {
    console.error('Erro ao editar participante:', error);
    res.status(500).json({ erro: 'Erro ao atualizar participante.' });
  }
});

/**
 * DELETE /api/participantes/:id - Remove participante
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [resultado] = await pool.execute('DELETE FROM participantes WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Participante não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao apagar participante:', error);
    res.status(500).json({ erro: 'Erro ao remover participante.' });
  }
});

/**
 * PATCH /api/participantes/:id/ativar - Ativa ou inativa participante
 */
router.patch('/:id/ativar', async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM participantes WHERE id = ?', [id]);
    const existente = rows[0];

    if (!existente) {
      return res.status(404).json({ erro: 'Participante não encontrado.' });
    }

    const novoAtivo = ativo !== false ? 1 : 0;
    const agora = new Date().toISOString();

    await pool.execute(
      'UPDATE participantes SET ativo = ?, data_atualizacao = ? WHERE id = ?',
      [novoAtivo, agora, id]
    );

    const [atualizados] = await pool.execute('SELECT * FROM participantes WHERE id = ?', [id]);
    const atualizado = atualizados[0];
    res.json({
      id: atualizado.id,
      nome: atualizado.nome,
      ativo: Boolean(atualizado.ativo),
      dataCriacao: atualizado.data_criacao,
      dataAtualizacao: atualizado.data_atualizacao,
    });
  } catch (error) {
    console.error('Erro ao alterar estado:', error);
    res.status(500).json({ erro: 'Erro ao atualizar participante.' });
  }
});

export default router;
