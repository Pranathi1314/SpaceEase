"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";

export default function DummyButton() {
  const router = useRouter();
  const { user } = useUser(); // Get the logged-in user

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!user) {
      alert("User not logged in. Please sign in to proceed with payment.");
      return;
    }
  
    // Fetch the MongoDB user ID
    try {
      const userResponse = await fetch(`/api/users?clerkId=${user.id}`);
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await userResponse.json();
  
      if (!userData._id) {
        throw new Error("User ID not found");
      }
  
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY, // Use the prefixed variable
        amount: 50000, // Amount in paise (₹500)
        currency: "INR",
        name: "Test Payment",
        description: "Demo Transaction",
        image: "https://your-logo-url.com/logo.png",
        handler: async function (response) {
          // Payment successful
          alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
  
          // Create a booking after payment
          try {
            const bookingResponse = await fetch("/api/bookings", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: userData._id, // Use the MongoDB user ID
                garageId: "67a8c02160607a4eac7470b3", // Dummy garage ID
                vehicleType: "fourWheeler", // Dummy vehicle type
                duration: 2, // Dummy duration (2 hours)
                endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
              }),
            });
  
            if (!bookingResponse.ok) {
              throw new Error("Failed to create booking");
            }
  
            const booking = await bookingResponse.json();
            console.log("Booking created:", booking);
  
            // Redirect to the user home page
            router.push("/");
          } catch (error) {
            console.error("Error creating booking:", error);
            alert("Payment successful, but booking creation failed. Please contact support.");
          }
        },
        prefill: {
          name: user.firstName || "User", // Use the user's first name
          email: user.primaryEmailAddress?.emailAddress || "user@example.com", // Use the user's email
          contact: user.phoneNumbers[0]?.phoneNumber || "9999999999", // Use the user's phone number
        },
        theme: {
          color: "#3399cc",
        },
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Failed to fetch user data. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={handlePayment}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
      >
        Pay Now
      </button>
    </div>
  );
}