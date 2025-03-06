import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import ManagerRequest from "@/models/ManagerRequest";

export async function POST(request) {
  try {
    await connectToDB();
    const { requestId } = await request.json();

    if (!requestId) {
      throw new Error('Request ID is required');
    }

    // Approve manager request
    const managerRequest = await ManagerRequest.findByIdAndUpdate(
      requestId,
      { status: 'approved' },
      { new: true }
    );

    if (!managerRequest) {
      throw new Error('Manager request not found');
    }

    // Update user verification status
    const updatedUser = await User.findByIdAndUpdate(
      managerRequest.userId,
      { isManagerVerified: true },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return new Response(JSON.stringify(managerRequest), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in verify-manager API:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}