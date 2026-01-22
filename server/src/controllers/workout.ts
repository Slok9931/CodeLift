import { Response } from "express";
import Workout from "../models/Workout"
import { AuthRequest } from "../types"

export const addWorkout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userIds, date, notes, startTime, endTime } = req.body;

    if (!userIds || !date || !startTime) {
      res.status(400).json({ error: "userIds, date, and startTime are required" });
      return;
    }
    const workout = new Workout({
      workoutId: `wo_${Date.now()}`,
      userIds,
      date,
      notes,
      startTime,
      endTime,
    })
    await workout.save();
    res.status(201).json({
      message: "Workout added successfully",
      workout
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to add workout",
      details: error.message,
    });
  }
}

export const getWorkouts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const workouts = await Workout.find();
    res.status(200).json(workouts);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch workouts",
      details: error.message,
    });
  }
};

export const getWorkoutById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const workout = await Workout.findOne({ workoutId: id });
    if (!workout) {
      res.status(404).json({ error: "Workout not found" });
      return;
    }
    res.status(200).json({workout});
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch workout",
      details: error.message,
    });
  }
};

export const deleteWorkout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const workout = await Workout.findOneAndDelete({ workoutId: id });
    if (!workout) {
      res.status(404).json({ error: "Workout not found" });
      return;
    }
    res.status(200).json({ message: "Workout deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to delete workout",
      details: error.message,
    });
  }
};

export const updateWorkout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const workout = await Workout.findOneAndUpdate(
      { workoutId: id },
      updates,
      { new: true }
    );

    if (!workout) {
      res.status(404).json({ error: "Workout not found" });
      return;
    }

    res.status(200).json({
      message: "Workout updated successfully",
      workout,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update workout",
      details: error.message,
    });
  }
};

export const getWorkoutsByUserId = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const workouts = await Workout.find({ userIds: userId }).sort({ date: -1 });
    res.status(200).json({workouts});
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch workouts for user",
      details: error.message,
    });
  }
};