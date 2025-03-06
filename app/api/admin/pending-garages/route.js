import { connectToDB } from "@/utils/database";
import Garage from "@/models/Garage";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDB();

    // Fetch all unverified garages with manager details
    const garages = await Garage.find({ verified: false })
      .populate({
        path: 'managerId',
        select: 'email',
      })
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(garages), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}