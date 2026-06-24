import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";

export async function findUserByUnionId(unionId: string) {
  // For custom auth, we use email as the identifier
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: Partial<InsertUser> & { unionId?: string; avatar?: string }) {
  const values: InsertUser = {
    name: data.name || "User",
    email: data.unionId || data.email || "",
    passwordHash: data.passwordHash || "",
    role: data.role || "receptionist",
    phone: data.phone || null,
  };

  const updateSet: Partial<InsertUser> = {
    name: data.name,
    role: data.role,
  };

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}
