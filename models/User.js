// models/users.js
import { Schema, model, models } from "mongoose";
import CarDetails from "./cardetails";

const UserSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  carDetails: [
    {
      type: Schema.Types.ObjectId,
      ref: CarDetails,
    },
  ],
  role: { type: String, enum: ["user", "manager", "admin","null"], default: "null" },
  isManagerVerified: { type: Boolean, default: false },
});

const User = models.User || model("User", UserSchema);
export default User;
