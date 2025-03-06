"use server";
import User from "@/models/User";
import { connectToDB } from "@/utils/database";

export async function createUser(user) {
  try {
    await connectToDB();
    
    const existingUser = await User.findOne({ clerkId: user.clerkId });
    if (existingUser) {
      return JSON.parse(JSON.stringify(existingUser)); // Convert to plain object
    }
    
    const newUser = new User(user);
    await newUser.save();

    // Convert Mongoose document to plain object and handle ObjectId
    const userObj = newUser.toObject({
      versionKey: false,
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        return ret;
      }
    });

    return userObj;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}