import prisma from "../db/db.config.js";
import { formatErrors } from "../utils/commonFunctions.js";
import { ZodError } from "zod";

class orderController {
  static async createOrder(req, res) {
    try {
      const { products, type } = req.body;

      const newOrder = await prisma.order.create({
        data: {
          uid: req.user.uid,
          order_status: "Order Placed",
          shipping_cost: 0,
          total_amt: 0,
          type,
          orderDetails: {
            create: products.map((p) => ({
              ...p,
              is_missing: false,
            })),
          },
        },
        include: { orderDetails: true },
      });

      res.status(201).json(newOrder);
    } catch (error) {
      const errors = error instanceof ZodError ? formatErrors(error) : error;
      console.error("Error during login:", errors);
      return res.status(500).json({ msg: errors, error: error.message });
    }
  }
}

export default orderController;
