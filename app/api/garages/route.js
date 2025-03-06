import { connectToDB } from "@/utils/database";
import Garage from "@/models/Garage";

export const GET = async (req, res) => {
  try {
    await connectToDB();
    const garages = await Garage.find({ verified: true }); // Only fetch verified garages
    return new Response(JSON.stringify(garages), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch garages", { status: 500 });
  }
};