import { Types } from "mongoose";
import { connectDB } from "@/src/lib/db";
import HomepageBanner from "@/src/models/homepage-banner.model";
import { updateHomepageBannerSchema } from "@/src/validations/homepage-banner.validation";
import { requireAdmin } from "@/src/lib/auth/require-admin";

async function getId(params: Promise<{ id: string }>) {
  const { id } = await params;
  return Types.ObjectId.isValid(id) ? id : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.authorized) {
    return Response.json({ success: false, message: adminCheck.message }, { status: adminCheck.status });
  }
  try {
    const id = await getId(params);
    if (!id) return Response.json({ success: false, message: "Invalid banner ID" }, { status: 400 });
    await connectDB();
    const result = updateHomepageBannerSchema.safeParse(await request.json());
    if (!result.success) return Response.json({ success: false, message: "Invalid banner data", errors: result.error.flatten() }, { status: 400 });
    const banner = await HomepageBanner.findByIdAndUpdate(id, result.data, { new: true, runValidators: true });
    if (!banner) return Response.json({ success: false, message: "Banner not found" }, { status: 404 });
    return Response.json({ success: true, banner });
  } catch (error) {
    console.error("Homepage banner update error:", error);
    return Response.json({ success: false, message: "Failed to update homepage banner" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.authorized) {
    return Response.json({ success: false, message: adminCheck.message }, { status: adminCheck.status });
  }
  try {
    const id = await getId(params);
    if (!id) return Response.json({ success: false, message: "Invalid banner ID" }, { status: 400 });
    await connectDB();
    const banner = await HomepageBanner.findByIdAndDelete(id);
    if (!banner) return Response.json({ success: false, message: "Banner not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Homepage banner deletion error:", error);
    return Response.json({ success: false, message: "Failed to delete homepage banner" }, { status: 500 });
  }
}
