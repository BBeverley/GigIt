import { SignJWT } from 'jose';

export async function createTestJwt(input: {
  sub: string;
  role?: 'Admin' | 'PM' | 'Technician' | 'Warehouse' | 'SeniorTechnician';
}) {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_ISSUER = 'test-issuer';
  process.env.JWT_AUDIENCE = 'test-aud';

  const claims: Record<string, unknown> = {};
  if (input.role) claims.role = input.role;

  const token = await new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(input.sub)
    .setIssuer('test-issuer')
    .setAudience('test-aud')
    .setExpirationTime('2h')
    .sign(new TextEncoder().encode('test-secret'));

  return token;
}

