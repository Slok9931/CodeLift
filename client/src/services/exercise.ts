import config, { apiClient } from "../config/api";
import type { Exercise } from "../types";

type RawExercise = Partial<Exercise> & {
  name?: string;
  gifUrl?: string;
  targetMuscles?: string[];
  secondaryMuscles?: string[];
  equipments?: string[];
  bodyParts?: string[];
  instructions?: string[];
};

const normalizeExercise = (raw: RawExercise): Exercise => {
  const title = raw.title || raw.name || "Untitled exercise";
  const description =
    raw.description ||
    (Array.isArray(raw.instructions) && raw.instructions.length > 0
      ? raw.instructions.join("\n")
      : "");

  const primaryMuscle =
    raw.primary_muscle || raw.targetMuscles?.[0] || raw.bodyParts?.[0] || "";

  const secondaryMuscles =
    raw.secondary_muscles?.length
      ? raw.secondary_muscles
      : raw.secondaryMuscles || [];

  const equipment =
    raw.equipment || raw.equipments?.[0] || "";

  return {
    _id: raw._id || raw.exerciseId || title,
    exerciseId: raw.exerciseId || raw._id || title,
    title,
    description,
    primary_muscle: primaryMuscle,
    secondary_muscles: secondaryMuscles,
    equipment,
    photoUrl: raw.photoUrl || raw.gifUrl || "",
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
};

class ExerciseService {
  static async getAllExercises(params?: {
    search?: string;
    muscle?: string;
    equipment?: string;
    page?: number;
    limit?: number;
  }): Promise<{ exercises: Exercise[] }> {
    const response = await apiClient.get(config.API_ENDPOINTS.EXERCISE.BASE, { params });
    const payload = response.data?.data ?? response.data;
    const rawExercises = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.exercises)
        ? payload.exercises
        : [];

    return {
      exercises: rawExercises.map((exercise: RawExercise) => normalizeExercise(exercise)),
    };
  }

  static async getExerciseById(id: string): Promise<{ exercise: Exercise }> {
    const response = await apiClient.get(
      `${config.API_ENDPOINTS.EXERCISE.BASE}/${id}`,
    );
    const payload = response.data?.data ?? response.data;
    const rawExercise = payload?.exercise ?? payload;

    return {
      exercise: normalizeExercise(rawExercise as RawExercise),
    };
  }

  static async addExercise(data: {
    title: string;
    description: string;
    primary_muscle:
      | "biceps"
      | "triceps"
      | "chest"
      | "back"
      | "legs"
      | "shoulders"
      | "core";
    secondary_muscles: (
      | "biceps"
      | "triceps"
      | "chest"
      | "back"
      | "legs"
      | "shoulders"
      | "core"
    )[];
    equipment:
      | "dumbbell"
      | "barbell"
      | "bodyweight"
      | "machine"
      | "kettlebell"
      | "resistance band";
    photoUrl: string;
  }): Promise<{ exercise: Exercise }> {
    const response = await apiClient.post(
      config.API_ENDPOINTS.EXERCISE.BASE,
      data,
    );
    const payload = response.data?.data ?? response.data;
    const rawExercise = payload?.exercise ?? payload;
    return { exercise: normalizeExercise(rawExercise as RawExercise) };
  }

  static async updateExercise(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      primary_muscle:
        | "biceps"
        | "triceps"
        | "chest"
        | "back"
        | "legs"
        | "shoulders"
        | "core";
      secondary_muscles: (
        | "biceps"
        | "triceps"
        | "chest"
        | "back"
        | "legs"
        | "shoulders"
        | "core"
      )[];
      equipment:
        | "dumbbell"
        | "barbell"
        | "bodyweight"
        | "machine"
        | "kettlebell"
        | "resistance band";
      photoUrl: string;
    }>,
  ): Promise<{ exercise: Exercise }> {
    const response = await apiClient.put(
      `${config.API_ENDPOINTS.EXERCISE.BASE}/${id}`,
      data,
    );
    const payload = response.data?.data ?? response.data;
    const rawExercise = payload?.exercise ?? payload;
    return { exercise: normalizeExercise(rawExercise as RawExercise) };
  }

  static async deleteExercise(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      `${config.API_ENDPOINTS.EXERCISE.BASE}/${id}`,
    );
    return response.data;
  }
}

export default ExerciseService;