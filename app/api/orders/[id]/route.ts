import { Types } from "mongoose";
import { auth } from "@/src/lib/auth";
import { connectDB } from "@/src/lib/db";
import Order from "@/src/models/order.model";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import {} from "@/src/models/order.validation";

//Get a single order by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
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

    await connectDB();

    const { id } = await params;

    // Validate the order ID
    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid order ID",
        },
        { status: 400 },
      );
    }

    // Find the order by ID
    const order = await Order.findById(id).populate("items.product");

    if (!order) {
      return Response.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 },
      );
    }

    // Customers can only view their own orders
    if (
      order.user.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return Response.json(
        {
          success: false,
          message: "Access denied",
        },
        { status: 403 },
      );
    }
    return Response.json(
      {
        success: true,
        message: "Order fetched successfully",
        order,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    return Response.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

// Update order status - admin only
export async function PATCH(
  req: Request,
   { params }: { params: Promise<{ id: string }> }
){
      try {
            //Check auuthorization
            const authorization = await requireAdmin(req);

            if(!authorization.authorized){
                  return Response.json(
                        {
                              success: false,
                              message: "Access denied",
                        },
                        { status:authorization.status }
                  )
            }
            await connectDB();

            const { id } = await params;

            //Validate the order ID
            if(!Types.ObjectId.isValid(id)){
                  return Response.json(
                        {
                              success: false,
                              message: "Invalid order ID",
                        },
                        { status: 400 }
                  )
            }
      }
}
