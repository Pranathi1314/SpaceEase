import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import ManagerRequest from "@/models/ManagerRequest";


export async function POST(request) {
  try {
    await connectToDB();
    const { userId, role } = await request.json();

    // Update user role
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { role },
      { new: true, upsert: true }
    );

    // Create manager request if role is manager
    if (role === 'manager') {
      await ManagerRequest.create({
        userId: user._id
      });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}