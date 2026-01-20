import { pool } from '../../db/client';

export async function provisionUser(input: {
  userId: string;
  email?: string;
  displayName?: string;
}) {
  const { userId, email, displayName } = input;

  await pool.query(
    `
      insert into users (user_id, email, display_name)
      values ($1, $2, $3)
      on conflict (user_id) do update
      set email = excluded.email,
          display_name = excluded.display_name
    `,
    [userId, email ?? null, displayName ?? null],
  );

  const { rows } = await pool.query<{
    user_id: string;
    email: string | null;
    display_name: string | null;
    created_at: string;
  }>('select user_id, email, display_name, created_at from users where user_id = $1', [userId]);

  return rows[0];
}

