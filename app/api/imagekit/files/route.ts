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

  if (!privateKey) {
    console.error("ImageKit private key is not configured");
    return Response.json(
      { success: false, message: "Image library is not configured." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch("https://api.imagekit.io/v1/files?limit=100", {
      headers: {
        Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
      },
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("ImageKit file listing failed:", response.status);
      return Response.json(
        { success: false, message: "Could not load the image library." },
        { status: 502 },
      );
    }

    return Response.json({ success: true, files: data });
  } catch (error) {
    console.error("ImageKit file listing error:", error);
    return Response.json(
      { success: false, message: "Could not load the image library." },
      { status: 502 },
    );
  }
}
