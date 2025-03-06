import { connectToDB } from "@/utils/database";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    await connectToDB();
    const { userId, garageId, vehicleType, duration, endTime } = await request.json();

    // Validate required fields
    if (!userId || !garageId || !vehicleType || !duration || !endTime) {
      throw new Error("Missing required fields");
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId");
    }

    if (!mongoose.Types.ObjectId.isValid(garageId)) {
      throw new Error("Invalid garageId");
    }

    console.log("Creating booking with data:", {
      userId,
      garageId,
      vehicleType,
      duration,
      endTime,
    });

    // Create a new booking
    const booking = await Booking.create({
      userId,
      garageId,
      vehicleType,
      duration,
      endTime: new Date(endTime),
    });

    console.log("Booking created successfully:", booking);

    return new Response(JSON.stringify(booking), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}