import { env } from "@migrate/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export function createDb() {
  return drizzle(env.DATABASE_URL, { schema });
}

export const db = createDb();
export const { users, credentials } = schema;
export type { User, NewUser, Credential, NewCredential } from "./schema";
