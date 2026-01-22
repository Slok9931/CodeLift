import { Router } from "express";
import passport from "passport";
import AuthController from "../controllers/auth";

const router = Router();
const authController = new AuthController();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.googleCallback
);

router.get("/logout", authController.logout);
router.get("/check", authController.checkAuth);

router.get("/token/:token", (req, res) => {
  const { token } = req.params;
  try {
    const user = require("../utils/tokenStore").getUserFromToken(token);

    if (user) {
      res.json({ authenticated: true, user });
    } else {
      res.status(401).json({ authenticated: false, message: "Invalid token" });
    }
  } catch (error) {
    res.status(500).json({ authenticated: false, message: "Server error" });
  }
});

export default router;
