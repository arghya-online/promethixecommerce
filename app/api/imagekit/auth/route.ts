import { createHmac, randomBytes } from "node:crypto";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export async function GET(request: Request) {
  const authorization = await requireAdmin(request);

  if (!authorization.authorized) {
    return Response.json(
      { success: false, message: authorization.message },
      { status: authorization.status },
    );
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

  if (!privateKey || !publicKey) {
    console.error("ImageKit credentials are not configured");
    return Response.json(
      { success: false, message: "Image upload is not configured." },
      { status: 500 },
    );
  }

  const expire = Math.floor(Date.now() / 1000) + 600;
  const token = randomBytes(16).toString("hex");
  const signature = createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return Response.json({
    success: true,
    authenticationParameters: {
      expire,
      publicKey,
      signature,
      token,
    },
  });
}
