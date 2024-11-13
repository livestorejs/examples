import { useScopedQuery } from '@livestore/react';
import { querySQL, sql } from '@livestore/livestore';
import { Schema } from 'effect';
import { tables, User } from '@/schema';

/**
 * @returns The first user in the users table.
 */
export function useUser(userId?: string): User {
  const query = userId
    ? querySQL(sql`SELECT * FROM users WHERE id = '${userId}'`, {
        schema: Schema.Array(tables.users.schema),
      })
    : querySQL(sql`SELECT * FROM users LIMIT 1`, {
        schema: Schema.Array(tables.users.schema),
      });

  const users = useScopedQuery(() => query, ['use-user']);

  return users[0];
}
