import { NextResponse } from "next/server";
import connectToDB from "@/utils/database";
import Garage from "@/models/Garage";
import User from "@/models/User"; // Ensure the User model is imported

export async function POST(req) {
  try {
    await connectToDB(); // ✅ Ensure database is connected

    const { name, location, capacity, managerEmail, fourWheeler, twoWheeler, ev , photoUrl, paperUrl } = await req.json();

    // ✅ Validate required fields
    if (
      !name ||
      !location?.latitude ||
      !location?.longitude ||
      typeof fourWheeler !== "number" ||
      typeof twoWheeler !== "number" ||
      typeof ev !== "number" ||
      !managerEmail ||
      !paperUrl
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid input data. Ensure name, location (latitude, longitude), vehicle capacities, and managerEmail are provided." },
        { status: 400 }
      );
    }

    // ✅ Find the manager using email
    const manager = await User.findOne({ email: managerEmail });
    if (!manager) {
      return NextResponse.json(
        { success: false, message: "Manager not found with the provided email." },
        { status: 404 }
      );
    }

    // ✅ Create and save the new garage with managerId
    const newGarage = new Garage({
      name,
      location,
      fourWheeler,
      twoWheeler,
      ev,
      managerId: manager._id, // ✅ Assigning correct ObjectId
      photoUrl,
      paperUrl,
    });

    await newGarage.save();

    return NextResponse.json(
      { success: true, message: "Garage added successfully", data: JSON.parse(JSON.stringify(newGarage)) },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding garage:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
