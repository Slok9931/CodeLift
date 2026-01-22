import express from "express";
import { addSet, deleteSet, getSetById, getSets, getSetsByWorkouts, updateSet } from "../controllers/set"
import { isAuthenticated } from "../middleware/auth"

const router = express.Router();

router.post("/", isAuthenticated, addSet);
router.get("/", isAuthenticated, getSets);
router.get("/:id", isAuthenticated, getSetById);
router.delete("/:id", isAuthenticated, deleteSet);
router.put("/:id", isAuthenticated, updateSet);
router.get("/workout/:userId", isAuthenticated, getSetsByWorkouts);

export default router;