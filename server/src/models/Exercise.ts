import mongoose, { Schema } from "mongoose";
import { Exercise } from "../types"

const ExerciseSchema = new Schema<Exercise>(
  {
    exerciseId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      index: true,
    },
    primary_muscle: {
      type: String,
      enum: ['biceps', 'triceps', 'chest', 'back', 'legs', 'shoulders', 'core'],
      required: true,
    },
    secondary_muscles: [{
      type: String,
      enum: ['biceps', 'triceps', 'chest', 'back', 'legs', 'shoulders', 'core'],
    }],
    equipment: {
      type: String,
      enum: ['dumbbell', 'barbell', 'bodyweight', 'machine', 'kettlebell', 'resistance band'],
      required: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Exercise>("Exercise", ExerciseSchema);