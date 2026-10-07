import { connectDB } from "@/src/lib/db";
import Product from "@/src/models/products.model";
import { createProductSchema } from "@/src/validations/product.validation";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import Category from "@/src/models/category.model";

//POST method to create a new product
export async function POST(request: Request) {
  // Check if the user is an admin
  const adminCheck = await requireAdmin(request);

  //Stop unauthorized users from creating products
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
    await connectDB();

    const body = await request.json();

    // Validate the request body against the schema
    const validationResult = createProductSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid request body",
          errors: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const product = await Product.create(body);

    return new Response(JSON.stringify(product), { status: 201 });
  } catch (error) {
    // Log the actual error on the server
    console.error("Product creation error:", error);

    // Handle duplicate slug error from MongoDB
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return Response.json(
        {
          success: false,
          message: "A product with this slug already exists",
        },
        { status: 409 },
      );
    }

    // Handle all other unexpected errors
    return Response.json(
      {
        success: false,
        message: "Failed to create product",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Read pagination values from the URL
    const { searchParams } = new URL(request.url);

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 20, 1),
      100,
    );

    // Calculate how many products MongoDB should skip
    const skip = (page - 1) * limit;

    // Get products for the requested page
    const products = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total number of products
    const totalProducts = await Product.countDocuments();

    // Calculate total number of pages
    const totalPages = Math.ceil(totalProducts / limit);

    return Response.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Product fetching error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}
