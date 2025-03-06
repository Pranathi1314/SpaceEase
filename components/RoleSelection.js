"use client"
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RoleSelection() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role) => {
    try {
      setLoading(true);
      const response = await fetch('/api/select-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          role: role,
        }),
      });

      if (response.ok) {
        // Fetch updated user data after role selection
        const userResponse = await fetch(`/api/users?clerkId=${user.id}`);
        const userData = await userResponse.json();

        // Redirect based on role
        if (role === 'manager') {
          router.push('/manager-route');
        } else {
          router.push('/'); // Redirect to home page
        }
      }
    } catch (error) {
      console.error('Error selecting role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Select Your Role</h2>
        <button
          onClick={() => handleRoleSelect('user')}
          className="bg-blue-500 text-white px-6 py-3 rounded-md mr-4 hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Continue as User'}
        </button>
        <button
          onClick={() => handleRoleSelect('manager')}
          className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Become a Manager'}
        </button>
      </div>
    </div>
  );
}