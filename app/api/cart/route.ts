import { Types } from "mongoose";
import { auth } from "@/src/lib/auth";
import { connectDB } from "@/src/lib/db";
import Cart from "@/src/models/cart.model";
import Product from "@/src/models/products.model";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "@/src/validations/cart.validation";

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
          cart: {
            items: [],
          },
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

    //Find  the  product in the database
    const product = await Product.findById(productId);

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    // Make sure the product is available
    if (!product.available) {
      return Response.json(
        {
          success: false,
          message: "Product not available",
        },
        { status: 400 },
      );
    }

    //Make sure enough stock is available
    if (product.stock < quantity) {
      return Response.json(
        {
          success: false,
          message: "Not enough stock available",
        },
        { status: 400 },
      );
    }

    //Find the existing cart for the user
    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      //Create a new cart if it doesn't exist
      cart = new Cart({
        user: session.user.id,
        items: [],
      });
    }

    //Check if the product is already in the cart
    const existingItem = cart.items.find(
      (item: { product: Types.ObjectId }) =>
        item.product.toString() === productId,
    );

    if (existingItem) {
      //Update the quantity of the existing item
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return Response.json(
          {
            success: false,
            message: "Insufficient stock",
          },
          { status: 400 },
        );
      }
    } else {
      //Add the new product to the cart
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    // Return the updated cart with product details populated
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
    );

    return Response.json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to add product to cart",
      },
      { status: 500 },
    );
  }
}

// Update the quantity of a product in the cart
export async function PATCH(request: Request) {
  try {
    // Get the logged-in user's session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    await connectDB();

    // Read request data
    const body = await request.json();

    // Validate update data
    const validationResult = updateCartItemSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid cart data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { productId, quantity } = validationResult.data;

    // Find the product
    const product = await Product.findById(productId);

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    // Check available stock
    if (quantity > product.stock) {
      return Response.json(
        {
          success: false,
          message: "Insufficient stock",
        },
        { status: 400 },
      );
    }

    // Find the user's cart
    const cart = await Cart.findOne({
      user: session.user.id,
    });

    if (!cart) {
      return Response.json(
        {
          success: false,
          message: "Cart not found",
        },
        { status: 404 },
      );
    }

    // Find the item inside the cart
    const item = cart.items.find(
      (item: { product: Types.ObjectId }) =>
        item.product.toString() === productId,
    );

    if (!item) {
      return Response.json(
        {
          success: false,
          message: "Product is not in the cart",
        },
        { status: 404 },
      );
    }

    // Update quantity and current price
    item.quantity = quantity;
    item.price = product.price;

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
    );

    return Response.json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Cart update error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update cart",
      },
      { status: 500 },
    );
  }
}

// Remove a product from the cart
export async function DELETE(request: Request) {
  try {
    // Get the logged-in user's session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    await connectDB();

    // Read product ID from the request body
    const body = await request.json();

    const productId = body.productId;

    if (typeof productId !== "string" || !Types.ObjectId.isValid(productId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 },
      );
    }

    // Find the user's cart
    const cart = await Cart.findOne({
      user: session.user.id,
    });

    if (!cart) {
      return Response.json(
        {
          success: false,
          message: "Cart not found",
        },
        { status: 404 },
      );
    }

    // Remove the selected product
    cart.items = cart.items.filter(
      (item: { product: Types.ObjectId }) =>
        item.product.toString() !== productId,
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
    );

    return Response.json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Cart deletion error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to remove cart item",
      },
      { status: 500 },
    );
  }
}
