import { z } from "zod";
import { connectDB } from "@/src/lib/db";
import CustomOrder from "@/src/models/custom-order.model";
import { requireAdmin } from "@/src/lib/auth/require-admin";

const customOrderSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(7, "Phone number is required"),
  projectTitle: z.string().trim().max(200).optional().or(z.literal("")),
  projectType: z.enum([
    "figurine",
    "gift",
    "decor",
    "mechanical",
    "robotics",
    "prototype",
    "other",
  ]),
  description: z.string().trim().min(10, "Please tell us more about your idea"),
  quantity: z.string().trim().max(100).optional().or(z.literal("")),
  dimensions: z.string().trim().max(200).optional().or(z.literal("")),
  material: z.string().trim().max(200).optional().or(z.literal("")),
  colorFinish: z.string().trim().max(200).optional().or(z.literal("")),
  application: z.string().trim().max(500).optional().or(z.literal("")),
  timeline: z.string().trim().max(200).optional().or(z.literal("")),
  budget: z.string().trim().max(200).optional().or(z.literal("")),
  fileUrls: z.array(z.string().url()).optional(),
  referenceCode: z.string().trim().optional(),
});

const updateCustomOrderSchema = z.object({
  status: z.enum(["new", "reviewing", "quoted", "approved", "in_production", "completed", "rejected", "cancelled"]).optional(),
  internalNotes: z.string().trim().max(2000).optional(),
  quoteAmount: z.number().min(0).nullable().optional(),
  quoteDetails: z.string().trim().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = customOrderSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid custom order request",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    await connectDB();

    const referenceCode =
      parsed.data.referenceCode?.trim() ||
      `PX-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

    const inquiry = await CustomOrder.create({
      ...parsed.data,
      referenceCode,
    });

    return Response.json(
      {
        success: true,
        message: "Your custom print inquiry has been received.",
        referenceCode,
        inquiry,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Custom order submission error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to submit your custom order request right now.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.authorized) {
      return Response.json({ success: false, message: adminCheck.message }, { status: adminCheck.status });
    }

    await connectDB();
    const params = new URL(request.url).searchParams;
    const limit = Math.min(Math.max(Number(params.get("limit")) || 50, 1), 100);
    const status = params.get("status");
    const query = status ? { status } : {};
    const inquiries = await CustomOrder.find(query).sort({ createdAt: -1 }).limit(limit);

    return Response.json({
      success: true,
      inquiries,
    });
  } catch (error) {
    console.error("Custom order fetch error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch custom order inquiries",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.authorized) {
    return Response.json({ success: false, message: adminCheck.message }, { status: adminCheck.status });
  }

  try {
    const body = await request.json();
    const parsed = updateCustomOrderSchema.safeParse(body);
    if (!parsed.success) return Response.json({ success: false, message: "Invalid custom request update", errors: parsed.error.flatten() }, { status: 400 });
    await connectDB();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ success: false, message: "Request id is required" }, { status: 400 });
    const inquiry = await CustomOrder.findByIdAndUpdate(id, { $set: parsed.data }, { new: true, runValidators: true });
    if (!inquiry) return Response.json({ success: false, message: "Custom request not found" }, { status: 404 });
    return Response.json({ success: true, inquiry });
  } catch (error) {
    console.error("Custom order update error:", error);
    return Response.json({ success: false, message: "Failed to update custom request" }, { status: 500 });
  }
}
