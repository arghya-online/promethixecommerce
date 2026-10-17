import { requireAdmin } from "@/src/lib/auth/require-admin";
import cloudinary from "@/src/lib/cloudinary";

export async function GET(request: Request) {
  const authorization = await requireAdmin(request);

  if (!authorization.authorized) {
    return Response.json(
      { success: false, message: authorization.message },
      { status: authorization.status },
    );
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      {
        success: false,
        message: "Cloudinary credentials are not configured.",
      },
      { status: 500 },
    );
  }

  try {
    const { resources } = await cloudinary.api.resources({
      type: "upload",
      prefix: "promethix3d",
      max_results: 50,
    });

    const files = resources.map((resource: {
      public_id: string;
      secure_url: string;
      format: string;
      bytes: number;
      created_at: string;
    }) => ({
      fileId: resource.public_id,
      name: resource.public_id.split("/").pop() || resource.public_id,
      url: resource.secure_url,
      thumbnailUrl: resource.secure_url,
      filePath: resource.public_id,
    }));

    return Response.json({ success: true, files });
  } catch (error) {
    console.error("Cloudinary file listing error:", error);
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch Cloudinary media files",
      },
      { status: 500 },
    );
  }
}
