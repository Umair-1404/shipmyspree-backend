import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import orderController from "../controllers/order.controller.js";

const router = Router();

// User Routes
router.get("/auth/fetchUser", authMiddleware, userController.fetchUser);
router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);
router.post("/auth/generate-otp", userController.generate);
router.post("/auth/verify-otp", userController.verify);
router.patch("/auth/update", authMiddleware, userController.update);

// Order Routes
router.post("/create", authMiddleware, orderController.createOrder);

export default router;
