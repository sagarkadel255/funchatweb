import { Router } from "express";
import { AuthController } from "../controllers/user.controller";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
// add remaining routes like login, logout, etc.

export default router;