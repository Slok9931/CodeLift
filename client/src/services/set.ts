import config, { apiClient } from "../config/api";
import type { Set } from "../types";

type RawExercise = {
  _id?: string;
  exerciseId?: string;
  title?: string;
  name?: string;
  description?: string;
  instructions?: string[];
  primary_muscle?: string;
  targetMuscles?: string[];
  bodyParts?: string[];
  secondary_muscles?: string[];
  secondaryMuscles?: string[];
  equipment?: string;
  equipments?: string[];
  photoUrl?: string;
  gifUrl?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type RawSet = Omit<Set, "primary_exercise" | "secondary_exercise"> & {
  primary_exercise: RawExercise;
  secondary_exercise?: RawExercise;
};

const normalizeExercise = (raw?: RawExercise) => {
  const title = raw?.title || raw?.name || "Untitled exercise";
  const description =
    raw?.description ||
    (Array.isArray(raw?.instructions) ? raw!.instructions!.join("\n") : "");

  return {
    _id: raw?._id || raw?.exerciseId || title,
    exerciseId: raw?.exerciseId || raw?._id || title,
    title,
    description,
    primary_muscle:
      raw?.primary_muscle || raw?.targetMuscles?.[0] || raw?.bodyParts?.[0] || "",
    secondary_muscles:
      raw?.secondary_muscles?.length
        ? raw.secondary_muscles
        : raw?.secondaryMuscles || [],
    equipment: raw?.equipment || raw?.equipments?.[0] || "",
    photoUrl: raw?.photoUrl || raw?.gifUrl || "",
    createdAt: raw?.createdAt || new Date().toISOString(),
    updatedAt: raw?.updatedAt || new Date().toISOString(),
  };
};

const normalizeSet = (set: RawSet): Set => ({
  ...set,
  primary_exercise: normalizeExercise(set.primary_exercise),
  secondary_exercise: set.secondary_exercise
    ? normalizeExercise(set.secondary_exercise)
    : undefined,
});

class SetService {
  static async getAllSets(): Promise<{ sets: Set[] }> {
    const response = await apiClient.get(config.API_ENDPOINTS.SET.BASE);
    const sets = (response.data?.sets || []).map((set: RawSet) => normalizeSet(set));
    return { ...response.data, sets };
  }

  static async getSetById(
    id: string
  ): Promise<{ set: Set }> {
    const response = await apiClient.get(
      `${config.API_ENDPOINTS.SET.BASE}/${id}`
    );
    const rawSet = response.data?.set;
    return { ...response.data, set: rawSet ? normalizeSet(rawSet) : rawSet };
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
    const rawSet = response.data?.set;
    return { ...response.data, set: rawSet ? normalizeSet(rawSet) : rawSet };
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
    const rawSet = response.data?.set;
    return { ...response.data, set: rawSet ? normalizeSet(rawSet) : rawSet };
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
    const rawSetsByExercise = response.data?.setsByExercise || {};
    const setsByExercise = Object.fromEntries(
      Object.entries(rawSetsByExercise).map(([exerciseId, sets]) => [
        exerciseId,
        (sets as RawSet[]).map((set) => normalizeSet(set)),
      ])
    );

    return {
      ...response.data,
      setsByExercise,
    };
  }
}

export default SetService;