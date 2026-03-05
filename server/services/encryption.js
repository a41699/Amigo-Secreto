import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Obtém a chave de encriptação (32 bytes)
 * A chave deve estar em ENCRYPTION_KEY no .env em hexadecimal
 */
function getKey() {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64 || !/^[0-9a-fA-F]+$/.test(keyHex)) {
    throw new Error(
      'ENCRYPTION_KEY inválida. Deve ter 64 caracteres hexadecimais (32 bytes). ' +
        'Gere com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(keyHex, 'hex');
}

/**
 * Encripta um texto com AES-256-GCM
 * @param {string} plaintext - Texto em claro
 * @returns {string} - Texto encriptado em formato base64 (iv:authTag:ciphertext)
 */
export function encrypt(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Desencripta um texto previamente encriptado
 * @param {string} encryptedData - Texto no formato iv:authTag:ciphertext
 * @returns {string} - Texto em claro
 */
export function decrypt(encryptedData) {
  const key = getKey();
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Dados encriptados inválidos');
  }

  const [ivBase64, authTagBase64, ciphertext] = parts;
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return decipher.update(ciphertext, 'base64', 'utf8') + decipher.final('utf8');
}

/**
 * Gera um token seguro para consulta (32 bytes em hex = 64 caracteres)
 * Usado para que cada participante aceda ao seu resultado
 */
export function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Gera um ID único (UUID-like) para entidades
 */
export function generateId() {
  return crypto.randomBytes(16).toString('hex');
}
