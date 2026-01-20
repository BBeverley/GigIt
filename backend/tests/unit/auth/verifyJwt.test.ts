import { describe, expect, it } from 'vitest';
import { SignJWT } from 'jose';

import { verifyJwt } from '../../../src/auth/verifyJwt';

describe('verifyJwt()', () => {
  it('verifies HS256 tokens when JWT_SECRET is set', async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_ISSUER = 'test-issuer';
    process.env.JWT_AUDIENCE = 'test-aud';

    const token = await new SignJWT({ email: 'a@example.com', name: 'A' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user-1')
      .setIssuer('test-issuer')
      .setAudience('test-aud')
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode('test-secret'));

    const claims = await verifyJwt(token);
    expect(claims.sub).toBe('user-1');
    expect(claims.email).toBe('a@example.com');
  });
});

