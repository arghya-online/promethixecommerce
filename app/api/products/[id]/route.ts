import { connectDB } from "@/src/lib/db";
import Product from "@/src/models/products.model";
import { Types } from "mongoose";
import { updateProductSchema } from "@/src/validations/product.validation";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import Category from "@/src/models/category.model";

// GET /api/products/:id
// This gets one product using its MongoDB ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get product ID from the URL
    const { id } = await params;

    // Check whether the ID is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 },
      );
    }

    // Find the product
    const product = await Product.findById(id).populate("category");

    // Product doesn't exist
    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    // Return the product
    return Response.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Product fetching error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch product",
      },
      { status: 500 },
    );
  }
}

// This updates an existing product
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Check whether the requester is an admin
  const adminCheck = await requireAdmin(request);

  // Stop unauthorized requests
  if (!adminCheck.authorized) {
    return Response.json(
      {
        success: false,
        message: adminCheck.message,
      },
      {
        status: adminCheck.status,
      },
    );
  }
  try {
    // Get product ID from the URL
    const { id } = await params;

    // Check whether the ID is valid
    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 },
      );
    }

    // Get the fields that need to be updated
    const body = await request.json();

    // Validate the update data using Zod
    const validationResult = updateProductSchema.safeParse(body);

    // Stop if the update data is invalid
    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid product data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Get the validated update data
    const productData = validationResult.data;
    // Check that the selected category exists
    const categoryExists = await Category.exists({
      _id: productData.category,
    });

    if (!categoryExists) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 400 },
      );
    }

    // Update the product using the validated data
    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    });

    // Product doesn't exist
    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    // Return updated product
    return Response.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Product update error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update product",
      },
      { status: 500 },
    );
  }
}
// DELETE /api/products/:id
// This permanently deletes a product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Check whether the requester is an admin
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.authorized) {
    return Response.json(
      {
        success: false,

        message: adminCheck.message,
      },
      { status: adminCheck.status },
    );
  }

  try {
    // Connect to MongoDB
    await connectDB();

    // Get product ID from the URL
    const { id } = await params;

    // Check whether the ID is valid
    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 },
      );
    }

    // Find the product and delete it
    const product = await Product.findByIdAndDelete(id);

    // Product doesn't exist
    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    // Return success response
    return Response.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    // Print the actual error in the terminal
    console.error("Product deletion error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      { status: 500 },
    );
  }
}
