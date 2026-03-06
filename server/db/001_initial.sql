-- Migração inicial: Amigo Secreto Seguro (MySQL)
-- Participantes do sorteio

CREATE TABLE IF NOT EXISTS participantes (
  id VARCHAR(32) PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  ativo TINYINT NOT NULL DEFAULT 1,
  data_criacao VARCHAR(30) NOT NULL,
  data_atualizacao VARCHAR(30) NOT NULL,
  INDEX idx_participantes_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Administradores (acesso ao painel /admin)
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(32) PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  nome VARCHAR(120) NOT NULL,
  password_salt VARCHAR(64) NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  ativo TINYINT NOT NULL DEFAULT 1,
  data_criacao VARCHAR(30) NOT NULL,
  data_atualizacao VARCHAR(30) NOT NULL,
  INDEX idx_admins_username (username),
  INDEX idx_admins_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sorteios realizados
CREATE TABLE IF NOT EXISTS sorteios (
  id VARCHAR(32) PRIMARY KEY,
  data_sorteio VARCHAR(30) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ativo',
  data_criacao VARCHAR(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Emparelhamento encriptado: participante_id -> amigo_secreto_id
-- Cada linha guarda o resultado encriptado + token único para consulta
CREATE TABLE IF NOT EXISTS participante_sorteio (
  id VARCHAR(32) PRIMARY KEY,
  sorteio_id VARCHAR(32) NOT NULL,
  participante_id VARCHAR(32) NOT NULL,
  resultado_encriptado TEXT NOT NULL,
  token_consulta VARCHAR(64) UNIQUE NOT NULL,
  data_criacao VARCHAR(30) NOT NULL,
  INDEX idx_participante_sorteio_token (token_consulta),
  INDEX idx_participante_sorteio_sorteio (sorteio_id),
  FOREIGN KEY (sorteio_id) REFERENCES sorteios(id) ON DELETE CASCADE,
  FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
