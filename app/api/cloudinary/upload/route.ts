import { requireAdmin } from "@/src/lib/auth/require-admin";
import cloudinary from "@/src/lib/cloudinary";

export async function POST(request: Request) {
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
        message: "Cloudinary is not fully configured in environment variables (requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).",
      },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json(
        { success: false, message: "No file provided" },
        { status: 400 },
      );
    }

    const fileBuffer = Buffer.from(await (file as File).arrayBuffer());
    const folder = (formData.get("folder") as string) || "promethix3d/products";

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
      format: string;
      bytes: number;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "auto",
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload failed"));
            } else {
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                bytes: result.bytes,
              });
            }
          },
        )
        .end(fileBuffer);
    });

    return Response.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Cloudinary upload failed",
      },
      { status: 500 },
    );
  }
}
