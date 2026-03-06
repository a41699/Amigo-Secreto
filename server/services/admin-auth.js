import crypto from 'crypto';

const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 horas

function toBase64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64Url(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + '='.repeat(padding), 'base64');
}

function getTokenSecret() {
  return process.env.ADMIN_AUTH_SECRET || process.env.ENCRYPTION_KEY;
}

export function hashPassword(password, saltHex = crypto.randomBytes(16).toString('hex')) {
  const salt = Buffer.from(saltHex, 'hex');
  const derived = crypto.scryptSync(password, salt, 64);
  return {
    salt: saltHex,
    hash: derived.toString('hex'),
  };
}

export function verifyPassword(password, saltHex, hashHex) {
  const salt = Buffer.from(saltHex, 'hex');
  const provided = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hashHex, 'hex');
  if (provided.length !== expected.length) return false;
  return crypto.timingSafeEqual(provided, expected);
}

export function createAdminToken(admin) {
  const secret = getTokenSecret();
  if (!secret) {
    throw new Error('Segredo de autenticação não configurado.');
  }

  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(
    JSON.stringify({
      sub: admin.id,
      usr: admin.username,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    })
  );
  const signature = toBase64Url(
    crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest()
  );
  return `${header}.${payload}.${signature}`;
}

export function verifyAdminToken(token) {
  const secret = getTokenSecret();
  if (!secret || !token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;

  const expectedSig = toBase64Url(
    crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest()
  );

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const decoded = JSON.parse(fromBase64Url(payload).toString('utf-8'));
    if (!decoded?.sub || !decoded?.usr || !decoded?.exp) return null;
    if (decoded.exp <= Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}
