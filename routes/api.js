import { Router } from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);
router.post("/auth/generate-otp", userController.generate);
router.post("/auth/verify-otp", userController.verify);
router.patch("/auth/update", authMiddleware, userController.update);

export default router;
