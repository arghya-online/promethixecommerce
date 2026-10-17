import { auth, syncEnvAdmin } from "@/src/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Connect Better Auth to Next.js API routes
const handler = toNextJsHandler(auth);

async function withEnvAdminSync(request: Request) {
  await syncEnvAdmin();
  return handler.POST(request);
}

export const GET = handler.GET;
export const POST = withEnvAdminSync;
