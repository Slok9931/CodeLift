import { Router } from "express";
import UserController from "../controllers/user";
import { isAuthenticated } from "../middleware/auth";

const router = Router();
const userController = new UserController();

router.get("/profile", isAuthenticated, userController.getProfile);
router.put("/profile", isAuthenticated, userController.updateProfile);

export default router;
