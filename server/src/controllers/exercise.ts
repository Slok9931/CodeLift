import { Request, Response } from "express";
import Exercise from "../models/Exercise"

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const normalizeEquipmentAliases = (equipment: string): string[] => {
  const normalized = equipment.trim().toLowerCase();

  const aliases: Record<string, string[]> = {
    bodyweight: ["bodyweight", "body weight", "body-weight"],
    "resistance band": ["resistance band", "band", "resistance-band"],
    machine: ["machine", "smith machine", "leverage machine", "cable machine"],
  };

  return aliases[normalized] || [normalized];
};

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
    const andConditions: any[] = [];

    if (typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
      andConditions.push({
        $or: [
          { title: searchRegex },
          { name: searchRegex },
          { description: searchRegex },
          { instructions: searchRegex },
        ],
      });
    }

    if (typeof muscle === "string" && muscle.trim()) {
      const muscleRegex = new RegExp(escapeRegex(muscle.trim()), "i");
      andConditions.push({
        $or: [
          { primary_muscle: muscleRegex },
          { targetMuscles: muscleRegex },
          { bodyParts: muscleRegex },
        ],
      });
    }

    if (typeof equipment === "string" && equipment.trim()) {
      const aliases = normalizeEquipmentAliases(equipment);
      const equipmentRegexes = aliases.map(
        (alias) => new RegExp(`^${escapeRegex(alias)}$`, "i"),
      );

      andConditions.push({
        $or: [
          { equipment: { $in: equipmentRegexes } },
          { equipments: { $in: equipmentRegexes } },
        ],
      });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 25);

    const exercises = await Exercise.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

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
