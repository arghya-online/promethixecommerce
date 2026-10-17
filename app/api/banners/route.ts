import { connectDB } from "@/src/lib/db";
import HomepageBanner from "@/src/models/homepage-banner.model";
import { homepageBannerSchema } from "@/src/validations/homepage-banner.validation";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export async function GET(request: Request) {
  try {
    await connectDB();
    const includeInactive = new URL(request.url).searchParams.get("admin") === "1";
    if (includeInactive) {
      const adminCheck = await requireAdmin(request);
      if (!adminCheck.authorized) {
        return Response.json({ success: false, message: adminCheck.message }, { status: adminCheck.status });
      }
    }
    const banners = await HomepageBanner.find(includeInactive ? {} : { isActive: true }).sort({ slot: 1, sortOrder: 1 });
    return Response.json({ success: true, banners });
  } catch (error) {
    console.error("Homepage banner fetching error:", error);
    return Response.json({ success: false, message: "Failed to fetch homepage banners" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.authorized) {
    return Response.json({ success: false, message: adminCheck.message }, { status: adminCheck.status });
  }

  try {
    await connectDB();
    const result = homepageBannerSchema.safeParse(await request.json());
    if (!result.success) {
      return Response.json({ success: false, message: "Invalid banner data", errors: result.error.flatten() }, { status: 400 });
    }
    const banner = await HomepageBanner.create(result.data);
    return Response.json({ success: true, banner }, { status: 201 });
  } catch (error) {
    console.error("Homepage banner creation error:", error);
    return Response.json({ success: false, message: "Failed to create homepage banner" }, { status: 500 });
  }
}
