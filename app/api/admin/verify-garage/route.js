import { connectToDB } from "@/utils/database";
import Garage from "@/models/Garage";

export async function POST(request) {
  try {
    await connectToDB();
    const { garageId } = await request.json();

    // Verify the garage
    const garage = await Garage.findByIdAndUpdate(
      garageId,
      { verified: true },
      { new: true }
    );

    if (!garage) {
      throw new Error('Garage not found');
    }

    return new Response(JSON.stringify(garage), {
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