import { auth } from "@/src/lib/auth";
import { connectDB } from "@/src/lib/db";
import Cart from "@/src/models/cart.model";
import Order from "@/src/models/order.model";
import Product from "@/src/models/products.model";
import { createOrderSchema } from "@/src/models/order.validation";

// Create an order from the current user's cart
export async function POST(req: Request) {
  try {
    // Get logged in user session
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

    // Connect to the database
    await connectDB();

    //Validate the request body against the order schema

    const body = await req.json();
    const validationResult = createOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid order data",
          errors: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Find the user's cart
    const cart = await Cart.findOne({
      user: session.user.id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Cart is empty",
        },
        { status: 400 },
      );
    }

    // Verify products and calculate totals on the server
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product);

      if (!product || !product.isActive) {
        return Response.json(
          {
            success: false,
            message: `Product ${item.product} is no longer available`,
          },
          { status: 400 },
        );
      }

      if (item.quantity > product.stock) {
        return Response.json(
          {
            success: false,
            message: `Insufficient stock for ${product.name}`,
          },
          { status: 400 },
        );
      }

      // Always use the current database price
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    // Calculate shipping on the server
    const shippingCost = subtotal >= 2000 ? 0 : 100;

    const total = subtotal + shippingCost;

    // Create the order
    const order = await Order.create({
      user: session.user.id,
      items: orderItems,
      shippingAddress: validationResult.data.shippingAddress,
      subtotal,
      shippingCost,
      total,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    // Reduce product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }

    // Empty the cart after creating the order
    cart.items = [];
    await cart.save();

    return Response.json(
      {
        success: true,
        order,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Order creation error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 },
    );
  }
}

// Get orders belonging to the current user
export async function GET(request: Request) {
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

    // Get the user's orders
    const orders = await Order.find({
      user: session.user.id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Order fetching error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 },
    );
  }
}
