import { createAuthClient } from "better-auth/react";

// Create the Better Auth client used by React components
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
