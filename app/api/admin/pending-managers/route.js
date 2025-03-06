import { connectToDB } from "@/utils/database";
import ManagerRequest from "@/models/ManagerRequest";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDB();

    // Fetch all pending requests with user details
    const requests = await ManagerRequest.find({ status: 'pending' })
      .populate({
        path: 'userId',
        select: 'email createdAt'
      })
      .sort({ createdAt: -1 });

    // Format the response data
    const formattedRequests = requests.map(request => ({
      _id: request._id,
      email: request.userId.email,
      requestedAt: request.createdAt,
      userId: request.userId._id
    }));

    return new Response(JSON.stringify(formattedRequests), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch pending requests',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}