import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { config } from "dotenv";
import { connectDB } from "./config/database";
import { initializePassport } from "./config/passport";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import exerciseRoutes from "./routes/exercise";
import workoutRoutes from "./routes/workout";
import setRoutes from './routes/set';
import { errorHandler } from "./middleware/errorHandler";

config();

const app = express();
const PORT = process.env.PORT;

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    name: "codeLift.session",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);
app.use((req, res, next) => {
  next();
});

app.use(passport.initialize());
app.use(passport.session());

connectDB();

initializePassport();

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/exercise", exerciseRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/set", setRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
