import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { verifyToken } from "./lib/jwt";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try Kimi OAuth first
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // OAuth not available, try custom JWT
  }

  // If no OAuth user, try custom JWT
  if (!ctx.user) {
    try {
      const authHeader = opts.req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const payload = await verifyToken(token);
        if (payload && payload.userId) {
          const db = getDb();
          const foundUser = await db.query.users.findFirst({
            where: eq(users.id, payload.userId),
          });
          if (foundUser) {
            ctx.user = foundUser;
          }
        }
      }
    } catch {
      // Custom auth not available
    }
  }

  return ctx;
}
