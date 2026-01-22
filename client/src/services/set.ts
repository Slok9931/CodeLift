import config, { apiClient } from "../config/api";
import type { Set } from "../types";

class SetService {
  static async getAllSets(): Promise<{ sets: Set[] }> {
    const response = await apiClient.get(config.API_ENDPOINTS.SET.BASE);
    return response.data;
  }

  static async getSetById(
    id: string
  ): Promise<{ set: Set }> {
    const response = await apiClient.get(
      `${config.API_ENDPOINTS.SET.BASE}/${id}`
    );
    return response.data;
  }

  static async addSet(data: {
    userId: string;
    workoutId: string;
    setNumber: number;
    type: "normal" | "dropset" | "superset";
    primary_exercise_id: string;
    secondary_exercise_id?: string;
    primary_reps: number[];
    secondary_reps?: number[];
    primary_weight: number[];
    secondary_weight?: number[];
  }): Promise<{ set: Set }> {
    const response = await apiClient.post(
      config.API_ENDPOINTS.SET.BASE,
      data
    );
    return response.data;
  }

  static async updateSet(
    id: string,
    data: Partial<{
      setNumber: number;
      type: "normal" | "dropset" | "superset";
      primary_exercise_id: string;
      secondary_exercise_id?: string;
      primary_reps: number[];
      secondary_reps?: number[];
      primary_weight: number[];
      secondary_weight?: number[];
    }>
  ): Promise<{ set: Set }> {
    const response = await apiClient.put(
      `${config.API_ENDPOINTS.SET.BASE}/${id}`,
      data
    );
    return response.data;
  }

  static async deleteSet(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      `${config.API_ENDPOINTS.SET.BASE}/${id}`
    );
    return response.data;
  }

  static async getSetsByWorkoutId(
    userId: string,
    workoutId: string
  ): Promise<{ workout: any; setsByExercise: any }> {
    const response = await apiClient.get(
      `${config.API_ENDPOINTS.SET.WORKOUT_SETS}/${userId}?workoutId=${workoutId}`
    );
    return response.data;
  }
}

export default SetService;