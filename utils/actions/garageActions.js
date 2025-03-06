// "use server";
// import Garage from "@/models/Garage";
// import { connectToDB } from "@/utils/database";

// export async function createGarage(garage) {
//   try {
//     await connectToDB();

//     // Check if a garage with the same name and location already exists
//     const existingGarage = await Garage.findOne({ name: garage.name, location: garage.location });
//     if (existingGarage) {
//       return { success: true, data: JSON.parse(JSON.stringify(existingGarage)) }; // ✅ Return success flag
//     }

//     // Create new garage entry
//     const newGarage = new Garage(garage);
//     await newGarage.save();

//     // Convert Mongoose document to plain object (handle ObjectId)
//     const garageObj = newGarage.toObject({
//       versionKey: false,
//       transform: (doc, ret) => {
//         ret._id = ret._id.toString();
//         return ret;
//       },
//     });

//     return { success: true, data: garageObj }; // ✅ Now returns a success flag

//   } catch (error) {
//     console.error("Error creating garage:", error);
//     return { success: false, message: error.message }; // ✅ Return an explicit error response
//   }
// };


// // ✅ Function to get all garages for a specific manager
// export const getGaragesByManager = async (managerEmail) => {
//   try {
//     await connectToDB();
//     const garages = await Garage.find({ managerEmail });

//     // ✅ Convert all MongoDB objects to JSON-safe format
//     return JSON.parse(JSON.stringify(garages));
//   } catch (error) {
//     console.error("Error fetching garages:", error);
//     return [];
//   }
// };

"use server";
import Garage from "@/models/Garage";
import User from "@/models/User"; // Ensure User model is imported
import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";

export async function createGarage(garage) {
  try {
    await connectToDB();

    // ✅ Find manager's ObjectId using email
    const manager = await User.findOne({ email: garage.managerEmail });
    if (!manager) {
      return { success: false, message: "Manager not found with the provided email." };
    }

    // ✅ Check if a garage with the same name and location already exists
    const existingGarage = await Garage.findOne({ name: garage.name, location: garage.location });
    if (existingGarage) {
      return { success: true, data: JSON.parse(JSON.stringify(existingGarage)) };
    }

    // ✅ Create new garage entry with correct `managerId`
    const newGarage = new Garage({
      ...garage,
      managerId: manager._id, // Correctly assign ObjectId
    });

    await newGarage.save();

    // ✅ Convert Mongoose document to a plain object (fix ObjectId issue)
    const garageObj = newGarage.toObject({ versionKey: false });

    // 🔹 Convert ObjectId fields to strings
    garageObj._id = garageObj._id.toString();
    garageObj.managerId = garageObj.managerId.toString(); // ✅ Fix ObjectId issue

    return { success: true, data: garageObj }; // ✅ Now safe for Client Component

  } catch (error) {
    console.error("Error creating garage:", error);
    return { success: false, message: error.message };
  }
};


// // ✅ Function to get all garages for a specific manager
// export const getGaragesByManager = async (managerEmail) => {
//   try {
//     if (!managerEmail) {
//       return { success: false, message: "Manager email is required" };
//     }

//     await connectToDB();
//     const garages = await Garage.find({ managerEmail }).lean(); // ✅ Use lean() for better performance

//     return { success: true, data: garages };
//   } catch (error) {
//     console.error("Error fetching garages:", error);
//     return { success: false, message: error.message };
//   }
// };


// ✅ Function to get all garages for a specific manager
export const getGaragesByManager = async (managerId) => {
  try {
    await connectToDB();

    // Ensure managerId is a valid ObjectId
    const objectId = new mongoose.Types.ObjectId(managerId);

    const garages = await Garage.find({ managerId: objectId });

    return JSON.parse(JSON.stringify(garages)); // Convert to JSON-safe format
  } catch (error) {
    console.error("Error fetching garages:", error);
    return [];
  }
};
