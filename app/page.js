"use client";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleSelection from "@/components/RoleSelection";
import UserHomePage from "@/components/UserHomePage";
import ManagerPage from "@/components/ManagerPage";
import AdminPage from "@/components/AdminPage";
import { createUser } from "@/utils/actions/action";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  // Fetch user data and create user if necessary
  useEffect(() => {
    const fetchAndCreateUser = async () => {
      if (isLoaded && isSignedIn) {
        try {
          // Fetch user data from your API
          const response = await fetch(`/api/users?clerkId=${user.id}`);
          let userData = await response.json();

          // If user doesn't exist, create a new user
          if (userData.error === "User not found") {
            const newUser = {
              clerkId: user.id,
              email: user.primaryEmailAddress.emailAddress,
              name: user.firstName,
              role: "null", // Set a default role
            };

            // Save the new user to the database
            const createdUser = await createUser(newUser);
            userData = createdUser;
          }

          // Update the state with the user data
          setUserData(userData);
        } catch (error) {
          console.error("Error fetching or creating user:", error);
        }
      }
    };

    fetchAndCreateUser();
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  // Admin check
  if (isLoaded && isSignedIn) {
    if (user.primaryEmailAddress.emailAddress === "ankettemp62@gmail.com") {
      return <AdminPage />;
    }
  }

  // Show RoleSelection if user role is not set
  if (userData?.role == "null") {
    return <RoleSelection />;
  }

  // Manager flow
  if (userData?.role === "manager") {
    if (userData.isManagerVerified) {
      return <ManagerPage />;
    }
    router.push("/manager-route");
    return null;
  }

  // User flow
  return <UserHomePage />;
}