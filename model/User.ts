import { Model, Schema, model, models } from "mongoose";
import type { ContinueReading } from "@/types/auth";

export interface IUser {
  name: string;
  email: string;
  password: string;
  coins: number;
  readChapters: string[];
  unlockedChapters: string[];
  favoriteMangaIds: string[];
  continueReading: ContinueReading | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const continueReadingSchema = new Schema<ContinueReading>(
  {
    mangaId: {
      type: String,
      required: true,
      trim: true,
    },
    mangaTitle: {
      type: String,
      required: true,
      trim: true,
    },
    chapterId: {
      type: String,
      required: true,
      trim: true,
    },
    chapterNumber: {
      type: String,
      required: true,
      trim: true,
    },
    chapterTitle: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

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
    favoriteMangaIds: {
      type: [String],
      default: [],
    },
    continueReading: {
      type: continueReadingSchema,
      default: null,
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

const existingUserModel = models.User as Model<IUser> | undefined;
const isStaleUserModel =
  existingUserModel &&
  (!existingUserModel.schema.path("favoriteMangaIds") ||
    !existingUserModel.schema.path("continueReading"));

if (isStaleUserModel) {
  delete models.User;
}

const User =
  (models.User as Model<IUser> | undefined) || model<IUser>("User", userSchema);

export default User;
