import { createAuthClient } from "better-auth/react";

// The client defaults to the current origin and the /api/auth route.
export const authClient = createAuthClient();
