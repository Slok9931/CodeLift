import mongoose, { Schema } from "mongoose";
import { Workout } from "../types"

const WorkoutSchema = new Schema<Workout>(
  {
    workoutId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userIds: [{
      type: String,
      required: true,
    }],
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

WorkoutSchema.index({ workoutId: 1 }, { unique: true });

export default mongoose.model<Workout>("Workout", WorkoutSchema);