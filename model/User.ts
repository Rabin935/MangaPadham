import { Model, Schema, model, models } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  coins: number;
  readChapters: string[];
  unlockedChapters: string[];
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    coins: {
      type: Number,
      default: 0,
      min: 0,
    },
    readChapters: {
      type: [String],
      default: [],
    },
    unlockedChapters: {
      type: [String],
      default: [],
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
