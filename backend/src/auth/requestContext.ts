import type { JwtClaims } from './verifyJwt';
import { verifyJwt } from './verifyJwt';

export type CurrentUser = {
  userId: string;
  email?: string;
  displayName?: string;
  claims: JwtClaims;
};

export async function buildRequestContext(token: string): Promise<CurrentUser> {
  const claims = await verifyJwt(token);

  if (!claims.sub) throw new Error('JWT missing sub');

  return {
    userId: claims.sub,
    email: typeof claims.email === 'string' ? claims.email : undefined,
    displayName: typeof claims.name === 'string' ? claims.name : undefined,
    claims,
  };
}

