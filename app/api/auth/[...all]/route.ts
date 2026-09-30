import { auth } from "@/src/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Connect Better Auth to Next.js API routes
export const { GET, POST } = toNextJsHandler(auth);
