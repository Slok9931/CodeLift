import { Response } from "express";
import Set from "../models/Set"
import Exercise from "../models/Exercise"
import { AuthRequest } from "../types"
import Workout from "../models/Workout"

export const addSet = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
      const { userId, workoutId, setNumber, type, primary_exercise_id, secondary_exercise_id, primary_reps, secondary_reps, primary_weight, secondary_weight } = req.body;
      if (!userId || !workoutId || !setNumber || !type || !primary_exercise_id || !primary_reps || !primary_weight) {
          res.status(400).json({ error: "Missing required fields" });
          return;
      }
    const primary_exercise = await Exercise.findOne({ exerciseId: primary_exercise_id });
    if (!primary_exercise) {
        res.status(404).json({ error: "Primary exercise not found" });
        return;
    }
    let secondary_exercise = null;
    if (secondary_exercise_id) {
        secondary_exercise = await Exercise.findOne({ exerciseId: secondary_exercise_id });
        if (!secondary_exercise) {
            res.status(404).json({ error: "Secondary exercise not found" });
            return;
        }
    }
    const set = new Set({
      userId,
      workoutId,
      setNumber,
      type,
      primary_exercise,
      secondary_exercise: secondary_exercise || undefined,
      primary_reps,
      secondary_reps: secondary_reps || undefined,
      primary_weight,
      secondary_weight: secondary_weight || undefined,
    });
    await set.save();
    res.status(201).json({
      message: "Set added successfully",
      set
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to add set",
      details: error.message,
    });
  }
}

export const getSets = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const sets = await Set.find();
    res.status(200).json(sets);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch sets",
      details: error.message,
    });
  }
};

export const getSetById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const set = await Set.findOne({ _id: id });
    if (!set) {
      res.status(404).json({ error: "Set not found" });
      return;
    }
    res.status(200).json(set);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch set",
      details: error.message,
    });
  }
};

export const deleteSet = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const set = await Set.findOneAndDelete({ _id: id });
    if (!set) {
      res.status(404).json({ error: "Set not found" });
      return;
    }
    res.status(200).json({ message: "Set deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to delete set",
      details: error.message,
    });
  }
};

export const updateSet = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const set = await Set.findOneAndUpdate(
      { _id: id },
      updates,
      { new: true }
    );

    if (!set) {
      res.status(404).json({ error: "Set not found" });
      return;
    }

    res.status(200).json({
      message: "Set updated successfully",
      set,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update set",
      details: error.message,
    });
  }
}

export const getSetsByWorkouts = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { userId } = req.params
        const { workoutId } = req.query
        if (!userId) {
            res.status(400).json({ error: "Missing userId parameter" })
            return
        }
        if (!workoutId) {
            res.status(400).json({ error: "Missing workoutId parameter" })
            return
        }
        const workout = await Workout.findOne({ workoutId: workoutId, userIds: userId })
        if (!workout) {
            res.status(404).json({ error: "Workout not found for the user" })
            return
        }
        const sets = await Set.find({ userId: userId, workoutId: workoutId }).populate("primary_exercise").populate("secondary_exercise").exec()
        const groupedSets: { [key: string]: any[] } = {}
        for (const set of sets) {
            const exerciseId = set.primary_exercise.exerciseId
            if (!groupedSets[exerciseId]) {
                groupedSets[exerciseId] = []
            }
            groupedSets[exerciseId].push(set)
        }
        res.status(200).json({
            workout: workout,
            setsByExercise: groupedSets
        })
    } catch (error: any) {
        res.status(500).json({
            error: "Failed to fetch sets by workouts",
            details: error.message,
        })
    }
}