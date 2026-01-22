import mongoose, { Schema } from "mongoose";
import { User } from "../types"

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    height: {
      type: Number,
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    age: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<User>("User", userSchema);

export default User;
