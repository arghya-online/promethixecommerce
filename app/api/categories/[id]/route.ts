import { Types } from "mongoose";
import { connectDB } from "@/src/lib/db";
import Category from "@/src/models/category.model";
import { updateCategorySchema } from "@/src/validations/category.validation";
import { requireAdmin } from "@/src/lib/auth/require-admin";

// Get a single category
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    // Check whether the ID is valid
    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 },
      );
    }

    const category = await Category.findById(id);

    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Category fetching error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch category",
      },
      { status: 500 },
    );
  }
}

// Update a category
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check admin authorization
    const authorization = await requireAdmin(request);

    if (!authorization.authorized) {
      return Response.json(
        {
          success: false,
          message: authorization.message,
        },
        { status: authorization.status },
      );
    }

    await connectDB();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 },
      );
    }

    // Read update data
    const body = await request.json();

    // Validate update data
    const validationResult = updateCategorySchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid category data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Update the category
    const category = await Category.findByIdAndUpdate(
      id,
      validationResult.data,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Category update error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update category",
      },
      { status: 500 },
    );
  }
}

// Delete a category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check admin authorization
    const authorization = await requireAdmin(request);

    if (!authorization.authorized) {
      return Response.json(
        {
          success: false,
          message: authorization.message,
        },
        { status: authorization.status },
      );
    }

    await connectDB();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 },
      );
    }

    // Delete the category
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Category deletion error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete category",
      },
      { status: 500 },
    );
  }
}
