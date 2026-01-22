import express from "express";
import { addWorkout, deleteWorkout, getWorkoutById, getWorkouts, getWorkoutsByUserId, updateWorkout } from "../controllers/workout"
import { isAuthenticated } from "../middleware/auth"

const router = express.Router();

router.post("/", isAuthenticated, addWorkout);
router.get("/", isAuthenticated, getWorkouts);
router.get("/:id", isAuthenticated, getWorkoutById);
router.delete("/:id", isAuthenticated, deleteWorkout);
router.put("/:id", isAuthenticated, updateWorkout);
router.get("/user/:userId", isAuthenticated, getWorkoutsByUserId);

export default router;