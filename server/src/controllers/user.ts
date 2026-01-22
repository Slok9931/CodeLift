import { Request, Response } from "express";
import User from "../models/User";

export default class UserController {
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await User.findById(req.user._id);
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      const updatedData = req.body;
      const user = await User.findByIdAndUpdate(userId, updatedData, {
        new: true,
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
}
