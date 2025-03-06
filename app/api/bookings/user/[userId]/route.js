import { connectToDB } from "@/utils/database";
import Booking from "@/models/Booking";

export async function GET(request, { params }) {
  try {
    await connectToDB();
    const { userId } =await params;

    // Fetch all bookings for the user
    const bookings = await Booking.find({ userId })
      .populate("garageId", "name location") // Populate garage details
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