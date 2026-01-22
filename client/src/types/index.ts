export interface User {
  _id: string;
  name: string;
  email: string;
  googleId: string;
  profilePicture?: string;
  gender?: "male" | "female" | "other";
  height?: number;
  weight?: number;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  _id: string;
  exerciseId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Workout {
  _id: string;
  workoutId: string;
  userIds: string[];
  date: Date;
  notes?: string;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Set {
  _id: string;
  userId: string;
  workoutId: string;
  setNumber: number;
  type: "normal" | "dropset" | "superset";
  primary_exercise: Exercise;
  secondary_exercise?: Exercise;
  primary_reps: number[];
  secondary_reps?: number[];
  primary_weight: number[];
  secondary_weight?: number[];
  createdAt: Date;
  updatedAt: Date;
}