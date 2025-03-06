import { connectToDB } from "@/utils/database"; // Ensure correct import path

export async function GET() {
  try {
    await connectToDB();
    return new Response(JSON.stringify({ message: "Connected to MongoDB successfully!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "MongoDB connection failed", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
