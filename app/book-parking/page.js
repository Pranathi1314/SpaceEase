"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";

const BookParking = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser(); // Get the logged-in user

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Extract Garage Data
  const garageId = searchParams.get("id");
  const garageName = searchParams.get("name");
  const location = searchParams.get("location");
  const availableTwoWheeler = searchParams.get("availableTwoWheeler");
  const twoWheelerPrice = parseFloat(searchParams.get("twoWheelerPrice")) || 0;
  const availableFourWheeler = searchParams.get("availableFourWheeler");
  const fourWheelerPrice = parseFloat(searchParams.get("fourWheelerPrice")) || 0;
  const availableEV = searchParams.get("availableEV");
  const evPrice = parseFloat(searchParams.get("evPrice")) || 0;

  const [vehicleType, setVehicleType] = useState("fourWheeler");
  const [duration, setDuration] = useState(0);
  const [totalPrice, setTotalPrice] = useState(fourWheelerPrice);

  // Function to get price based on vehicle type
  const getPrice = () => {
    if (vehicleType === "fourWheeler") return fourWheelerPrice;
    if (vehicleType === "twoWheeler") return twoWheelerPrice;
    if (vehicleType === "ev") return evPrice;
    return 0;
  };

  // Update total price whenever vehicleType or duration changes
  useEffect(() => {
    setTotalPrice(getPrice() * duration);
  }, [vehicleType, duration]);

  // const handleBooking = async () => {
  //   const response = await fetch("/api/book-spot", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ garageId, vehicleType, duration, totalPrice }),
  //   });

  //   if (response.ok) {
  //     alert(`Booking Confirmed! ✅ Total Price: ₹${totalPrice}`);
  //   } else {
  //     alert("Booking Failed ❌");
  //   }
  // };

  const handleBooking = async () => {
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
        amount: totalPrice * 100 , // Amount in paise (₹500)
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
                garageId: garageId, // Dummy garage ID
                vehicleType: vehicleType, // Dummy vehicle type
                duration: duration, // Dummy duration (2 hours)
                // endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
                endTime: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(), // Add the dynamic duration
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
    <div className="p-6 text-black max-w-md mx-auto bg-white rounded shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-2">Book a Spot at {garageName}</h2>
      <p className="text-gray-600 mb-4">📍 {location}</p>

      <label className="block">Select Vehicle Type:</label>
      <select
        className="border p-2 rounded w-full mt-2"
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value)}
      >
        <option value="fourWheeler">🚗 Four Wheeler (₹{fourWheelerPrice}/hr, Available: {availableFourWheeler})</option>
        <option value="twoWheeler">🏍️ Two Wheeler (₹{twoWheelerPrice}/hr, Available: {availableTwoWheeler})</option>
        <option value="ev">⚡ EV (₹{evPrice}/hr, Available: {availableEV})</option>
      </select>

      <label className="block mt-2">Duration (hours):</label>
      <input
        type="number"
        className="border p-2 rounded w-full"
        value={duration}
        onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
        min="1"
      />

      <p className="mt-4 text-lg font-bold">
        Total Price: ₹{totalPrice}
      </p>

      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        onClick={handleBooking}
      >
        Confirm Booking
      </button>
    </div>
  );
};

export default BookParking;
