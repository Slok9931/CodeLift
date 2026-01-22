import config, { apiClient } from "../config/api";
import type { Workout } from "../types"

class WorkoutService {
  static async getAllWorkouts(): Promise<{ workouts: Workout[] }> {
    const response = await apiClient.get(config.API_ENDPOINTS.WORKOUT.BASE);
    return response.data;
  }
    
  static async getWorkoutById(
    id: string
  ): Promise<{ workout: Workout }> {
    const response = await apiClient.get(
      `${config.API_ENDPOINTS.WORKOUT.BASE}/${id}`
    );
    return response.data;
  }

  static async addWorkout(data: {
    userIds: string[];
    date: Date;
    notes?: string;
    startTime: Date;
    endTime?: Date;
  }): Promise<{ workout: Workout }> {
    const response = await apiClient.post(
      config.API_ENDPOINTS.WORKOUT.BASE,
      data
    );
    return response.data;
  }

  static async updateWorkout(
    id: string,
    data: Partial<{
      userIds: string[];
      date: Date;
      notes?: string;
      startTime: Date;
      endTime?: Date;
    }>
  ): Promise<{ workout: Workout }> {
    const response = await apiClient.put(
      `${config.API_ENDPOINTS.WORKOUT.BASE}/${id}`,
      data
    );
    return response.data;
  }

  static async deleteWorkout(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      `${config.API_ENDPOINTS.WORKOUT.BASE}/${id}`
    );
    return response.data;
  }
    
  static async getWorkoutsByUserId(
    userId: string
  ): Promise<{ workouts: Workout[] }> {
    const response = await apiClient.get(
      `${config.API_ENDPOINTS.WORKOUT.USER_WORKOUTS}/${userId}`,
    );
    return response.data;
  }
}

export default WorkoutService;