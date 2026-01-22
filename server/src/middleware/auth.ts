import { Request, Response, NextFunction } from "express";
import { getUserFromToken } from "../utils/tokenStore";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const user = getUserFromToken(token);
    if (user) {
      (req as any).user = user;
      return next();
    }
  }
  const queryToken = req.query.token as string;
  if (queryToken) {
    const user = getUserFromToken(queryToken);
    if (user) {
      (req as any).user = user;
      return next();
    }
  }
  res.status(401).json({ message: "Unauthorized" });
};
