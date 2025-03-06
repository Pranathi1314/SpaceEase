"use client"
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import ManagerPage from "@/components/ManagerPage"; // Import the ManagerPage component

export default function ManagerPending() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isManagerVerified, setIsManagerVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/users?clerkId=${user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch user data");
        }

        setIsManagerVerified(data.isManagerVerified); // Assuming 'isManagerVerified' is a field in the user object
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (!isLoaded || loading) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to access this page.</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isManagerVerified) {
    return <ManagerPage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Manager Account Pending Approval</h1>
        <p className="text-gray-600">
          Your manager account request has been submitted. 
          Our admin team will review your application and notify you once approved.
        </p>
        <div className="mt-6 text-sm text-gray-500">
          Logged in as: {user.primaryEmailAddress.emailAddress}
        </div>
      </div>
    </div>
  );
}
