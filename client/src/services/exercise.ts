import config, { apiClient } from "../config/api";
import type { Exercise } from "../types";

class ExerciseService {
  static async getAllExercises(params?: {
    search?: string;
    muscle?: string;
    equipment?: string;
    page?: number;
    limit?: number;
  }): Promise<{ exercises: Exercise[] }> {
    const response = await apiClient.get(config.API_ENDPOINTS.EXERCISE.BASE, { params });
    return response.data;
  }

  static async getExerciseById(id: string): Promise<{ exercise: Exercise }> {
    const response = await apiClient.get(
      `${config.API_ENDPOINTS.EXERCISE.BASE}/${id}`,
    );
    return response.data;
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
    return response.data;
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
    return response.data;
  }

  static async deleteExercise(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      `${config.API_ENDPOINTS.EXERCISE.BASE}/${id}`,
    );
    return response.data;
  }
}

export default ExerciseService;