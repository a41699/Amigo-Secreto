import { encrypt, generateSecureToken, generateId } from './encryption.js';

const MIN_PARTICIPANTES = 3;

/**
 * Algoritmo de Fisher-Yates para embaralhar array
 */
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Gera um emparelhamento válido de Amigo Secreto
 * Garante que ninguém fica consigo próprio
 * @param {Array<{id: string, nome: string}>} participantes - Lista de participantes ativos
 * @returns {Array<{participanteId: string, amigoSecretoId: string}>}
 */
export function gerarEmparelhamento(participantes) {
  if (participantes.length < MIN_PARTICIPANTES) {
    throw new Error(`São necessários pelo menos ${MIN_PARTICIPANTES} participantes ativos.`);
  }

  const ids = participantes.map((p) => p.id);

  // Estratégia: criar um ciclo - cada pessoa dá ao próximo
  // Embaralhar para aleatoriedade
  let recebedores = shuffle(ids);

  // Garantir que ninguém recebe de si próprio (pode acontecer com shuffle)
  let tentativas = 0;
  const maxTentativas = 100;

  while (tentativas < maxTentativas) {
    let valido = true;
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] === recebedores[i]) {
        valido = false;
        break;
      }
    }
    if (valido) break;
    recebedores = shuffle(ids);
    tentativas++;
  }

  if (tentativas >= maxTentativas) {
    // Fallback: rotacionar (pessoa i dá para pessoa (i+1) % n)
    recebedores = ids.slice(1).concat(ids[0]);
  }

  return ids.map((dadorId, index) => ({
    participanteId: dadorId,
    amigoSecretoId: recebedores[index],
  }));
}

/**
 * Prepara os dados do sorteio para persistência
 * @param {Array} emparelhamento - Resultado de gerarEmparelhamento
 * @param {Map} idParaNome - Mapa id -> nome do amigo secreto
 * @returns {Array<{id, sorteioId, participanteId, resultadoEncriptado, tokenConsulta}>}
 */
export function prepararParaPersistencia(emparelhamento, sorteioId) {
  return emparelhamento.map(({ participanteId, amigoSecretoId }) => {
    // Encriptamos apenas o ID do amigo secreto (info mínima necessária)
    const resultadoEncriptado = encrypt(amigoSecretoId);
    const tokenConsulta = generateSecureToken();

    return {
      id: generateId(),
      sorteioId,
      participanteId,
      resultadoEncriptado,
      tokenConsulta,
    };
  });
}
