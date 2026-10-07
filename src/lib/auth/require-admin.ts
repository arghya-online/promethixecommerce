import { auth } from "../auth";

// Checks whether the current request belongs to an admin
export async function requireAdmin(request: Request) {
  // Get the authenticated session from the request cookies
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // No valid login session
  if (!session) {
    return {
      authorized: false,
      status: 401,
      message: "Authentication required",
    };
  }

  // User is logged in but does not have admin privileges
  if (session.user.role !== "admin") {
    return {
      authorized: false,
      status: 403,
      message: "Admin access required",
    };
  }

  // User is authenticated and is an admin
  return {
    authorized: true,
    session,
  };
}
