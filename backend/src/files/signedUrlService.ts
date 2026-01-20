import crypto from 'crypto';

type Action = 'upload' | 'download';

function getSecret() {
  return process.env.STORAGE_SIGNING_SECRET ?? 'dev-storage-signing-secret';
}

export function signPayload(input: { action: Action; objectKey: string; expiresAt: number }) {
  const payload = JSON.stringify(input);
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return { payload: Buffer.from(payload).toString('base64url'), sig };
}

export function verifyPayload(token: { payload: string; sig: string }) {
  const payloadJson = Buffer.from(token.payload, 'base64url').toString('utf8');
  const expected = crypto.createHmac('sha256', getSecret()).update(payloadJson).digest('base64url');
  if (expected !== token.sig) return null;

  const parsed = JSON.parse(payloadJson) as { action: Action; objectKey: string; expiresAt: number };
  if (Date.now() > parsed.expiresAt) return null;
  return parsed;
}

