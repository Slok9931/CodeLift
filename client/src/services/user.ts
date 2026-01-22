import config, { apiClient } from "../config/api";
import type { User } from "../types"

class UserService {
  static async getUserProfile(): Promise<{ user: User }> {
    const response = await apiClient.get(config.API_ENDPOINTS.USER.PROFILE);
    return response.data;
  }
    
  static async updateUserProfile(data: {
    name?: string;
    gender?: "male" | "female" | "other";
    height?: number;
    weight?: number;
    age?: number;
  }): Promise<{ user: User }> {
    const response = await apiClient.put(
      config.API_ENDPOINTS.USER.PROFILE,
      data
    );
    return response.data;
  }

  static async logout(): Promise<{ message: string }> {
    const response = await apiClient.get(config.API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  }
}

export default UserService;