import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createSecretKey } from 'crypto';

export type JwtClaims = {
  sub: string;
  email?: string;
  name?: string;
  [k: string]: unknown;
};

export async function verifyJwt(token: string): Promise<JwtClaims> {
  const issuer = process.env.JWT_ISSUER;
  const audience = process.env.JWT_AUDIENCE;

  // Dev/test escape hatch: allow HS256 verification via shared secret.
  const secret = process.env.JWT_SECRET;
  if (secret) {
    const key = createSecretKey(Buffer.from(secret));
    const { payload } = await jwtVerify(token, key, {
      issuer,
      audience,
    });
    return payload as JwtClaims;
  }

  const jwksUrl = process.env.JWT_JWKS_URL;
  if (!jwksUrl) throw new Error('JWT_JWKS_URL is required when JWT_SECRET is not set');

  const jwks = createRemoteJWKSet(new URL(jwksUrl));
  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience,
  });

  return payload as JwtClaims;
}

