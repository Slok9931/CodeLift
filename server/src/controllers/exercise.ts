import { Request, Response } from "express";
import Exercise from "../models/Exercise"

export const addExercise = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, primary_muscle, secondary_muscles, equipment, photoUrl } = req.body;

    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    const exercise = new Exercise({
      exerciseId: `ex_${Date.now()}`,
      title,
      description,
      primary_muscle,
      secondary_muscles,
      equipment,
      photoUrl,
    })
    await exercise.save();
    res.status(201).json({
      message: "Exercise added successfully",
      exercise
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to add exercise",
      details: error.message,
    });
  }
};

export const getExercises = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, muscle, equipment, page = "1", limit = "25" } = req.query;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (muscle) {
      filter.primary_muscle = muscle;
    }
    if (equipment) {
      filter.equipment = equipment;
    }
    const exercises = await Exercise.find(filter)
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));
    res.status(200).json({exercises});
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch exercises",
      details: error.message,
    });
  }
};

export const getExerciseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findOne({ exerciseId: id });
    if (!exercise) {
      res.status(404).json({ error: "Exercise not found" });
      return;
    }
    res.status(200).json({exercise});
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch exercise",
      details: error.message,
    });
  }
};

export const updateExercise = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const exercise = await Exercise.findOneAndUpdate(
      { exerciseId: id },
      updates,
      { new: true }
    );

    if (!exercise) {
      res.status(404).json({ error: "Exercise not found" });
      return;
    }

    res.status(200).json({
      message: "Exercise updated successfully",
      exercise,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update exercise",
      details: error.message,
    });
  }
};

export const deleteExercise = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findOneAndDelete({ exerciseId: id });

    if (!exercise) {
      res.status(404).json({ error: "Exercise not found" });
      return;
    }

    res.status(200).json({ message: "Exercise deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to delete exercise",
      details: error.message,
    });
  }
};
