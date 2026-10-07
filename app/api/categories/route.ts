import { connectDB } from "@/src/lib/db";
import Category from "@/src/models/category.model";
import { createCategorySchema } from "@/src/validations/category.validation";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export async function POST(request: Request) {
  try {
    // Check admin authorization
    const authorization = await requireAdmin(request);

    if (!authorization.authorized) {
      return Response.json(
        {
          success: false,
          message: authorization.message,
        },
        { status: authorization.status }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Read request data
    const body = await request.json();

    // Validate category data
    const validationResult = createCategorySchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid category data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Create the category
    const category = await Category.create(
      validationResult.data
    );

    return Response.json(
      {
        success: true,
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Category creation error:", error);

    // Handle duplicate slug
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return Response.json(
        {
          success: false,
          message: "A category with this slug already exists",
        },
        { status: 409 }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Failed to create category",
      },
      { status: 500 }
    );
  }
}

// Get all categories
export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get categories sorted by newest first
    const categories = await Category.find()
      .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Category fetching error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}