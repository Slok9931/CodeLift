import express from "express";
import { addExercise, deleteExercise, getExerciseById, getExercises, updateExercise } from "../controllers/exercise"

const router = express.Router();

router.post("/", addExercise);
router.get("/", getExercises);
router.get("/:id", getExerciseById);
router.put("/:id", updateExercise);
router.delete("/:id", deleteExercise);

export default router;
