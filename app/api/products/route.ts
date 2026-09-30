import { connectDB } from "@/src/lib/db";
import Product from "@/src/models/products.model";
import { createProductSchema } from "@/src/validations/product.validation";

//POST method to create a new product
export async function POST(request: Request) {
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

// GET method to fetch all products
export async function GET() {
  try {
    await connectDB();

    //Get all products from the database
    const products = await Product.find();

    return Response.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      {
        status: 500,
      },
    );
  }
}
