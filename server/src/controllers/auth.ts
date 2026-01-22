import { Request, Response } from "express";
import {
  generateToken,
  deleteToken,
} from "../utils/tokenStore";

export default class AuthController {

  public async checkAuth(req: Request, res: Response) {
    if (req.user) {
      res.json({ authenticated: true, user: req.user });
    } else {
      res.json({ authenticated: false, user: null });
    }
  }

  public async logout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      deleteToken(token);
    }
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  }

  public async googleCallback(req: Request, res: Response) {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    if (req.user) {
      const token = generateToken(req.user);
      req.session.save((err) => {
        if (err) {
          console.log("Session save error:", err);
        } else {
          console.log("Session saved successfully");
        }
      });

      const redirectUrl = `${clientUrl}/dashboard?token=${token}`;
      res.redirect(redirectUrl);
    } else {
      const errorUrl = `${clientUrl}/login?error=auth_failed`;
      res.redirect(errorUrl);
    }
  }
}
