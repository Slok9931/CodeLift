import mongoose, { Schema } from "mongoose";
import { Set } from "../types"

const SetSchema = new Schema<Set>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    workoutId: {
      type: String,
      required: true,
      index: true,
    },
    setNumber: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["normal", "dropset", "superset"],
      required: true,
    },
    primary_exercise: {
      type: Object,
      required: true,
    },
    secondary_exercise: {
      type: Object,
    },
    primary_reps: [{
      type: Number,
      required: true,
    }],
    secondary_reps: [{
      type: Number,
    }],
    primary_weight: [{
      type: Number,
      required: true,
    }],
    secondary_weight: [{
        type: Number,
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Set>("Set", SetSchema);