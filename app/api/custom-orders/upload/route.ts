import cloudinary from "@/src/lib/cloudinary";

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      {
        success: false,
        message: "Cloud storage is not configured.",
      },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json(
        { success: false, message: "No file was provided." },
        { status: 400 },
      );
    }

    const fileObj = file as File;
    const maxSizeBytes = 20 * 1024 * 1024; // 20MB
    if (fileObj.size > maxSizeBytes) {
      return Response.json(
        { success: false, message: "File exceeds maximum size limit of 20MB." },
        { status: 400 },
      );
    }

    const fileBuffer = Buffer.from(await fileObj.arrayBuffer());
    const folder = "promethix3d/custom-orders";

    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
      format: string;
      bytes: number;
      original_filename: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "auto",
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Upload failed"));
            } else {
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                bytes: result.bytes,
                original_filename: fileObj.name,
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
      name: fileObj.name,
      size: fileObj.size,
    });
  } catch (error) {
    console.error("Custom order file upload error:", error);
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "File upload failed",
      },
      { status: 500 },
    );
  }
}
