import { connectToDB } from "@/utils/database";
import Booking from "@/models/bookings";

export async function GET(request, { params }) {
  try {
    await connectToDB();
    const { garageId } = params;

    // Fetch all bookings for the garage
    const bookings = await Booking.find({ garageId })
      .populate("userId", "name email") // Populate user details
      .sort({ startTime: -1 });

    return new Response(JSON.stringify(bookings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}