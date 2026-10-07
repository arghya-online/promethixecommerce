import { Types } from "mongoose";
import { auth } from "@/src/lib/auth";
import { connectDB } from "@/src/lib/db";
import Cart from "@/src/models/cart.model";
import Product from "@/src/models/products.model";
import { addToCartSchema } from "@/src/validations/cart.validation";

//Get current user cart
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.email) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    await connectDB();

    //Find the  user's cart
    const cart = await Cart.findOne({
      user: session.user.id,
    }).populate("items.product");
    if (!cart) {
      return Response.json(
        {
          success: false,
          message: "Cart not found",
        },
        {
          status: 404,
        },
      );
    } else {
      return Response.json({
        success: true,
        cart: cart || {
          items: [],
        },
      });
    }
  } catch (error) {
    console.error("Cart fetching error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch cart",
      },
      { status: 500 },
    );
  }
}

// Add a product to the current user's cart
export async function POST(req: Request) {
  try {
    //Get the logged-in user session
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Read the request body
    const body = await req.json();

    //Validate the request body
    const validationResult = addToCartSchema.safeParse(body);
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

    const { productId, quantity } = validationResult.data;
    //Verify the pproduct  id
    if (!Types.ObjectId.isValid(productId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 },
      );
    }

    //Finnd  the  product in the database
    //Done till here
  } catch {}
}
