"use client";
import { useState, useEffect } from "react";
import GoogleMapView from "@/components/GoogleMapView";
import { UserLocationContext } from "@/context/UserLocationContext";
import { useUser } from "@clerk/clerk-react";
import RangeSelect from "@/components/fliters/RangeSelect";

export default function UserHomePage() {
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    ev: false,
    fourWheeler: false,
    twoWheeler: false,
  });
  const [radius, setRadius] = useState(2500); // Default radius
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser(); // Get the logged-in user

  // Fetch user location using Geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (user) {
        try {
          // Step 1: Fetch the MongoDB userId using the Clerk userId
          const userResponse = await fetch(`/api/users?clerkId=${user.id}`);
          if (!userResponse.ok) {
            throw new Error("Failed to fetch user data");
          }
          const userData = await userResponse.json();
  
          if (!userData._id) {
            throw new Error("User ID not found");
          }
  
          // Step 2: Fetch bookings using the MongoDB userId
          const bookingsResponse = await fetch(`/api/bookings/user/${userData._id}`);
          if (!bookingsResponse.ok) {
            throw new Error("Failed to fetch bookings");
          }
          const bookingsData = await bookingsResponse.json();
  
          // Step 3: Update the bookings state
          setBookings(bookingsData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };
  
    fetchBookings();
  }, [user]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter checkbox change
  const handleFilterChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [e.target.name]: e.target.checked,
    }));
  };

  // Handle radius change
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
  };

  return (
    <UserLocationContext.Provider value={{ userLocation, setUserLocation }}>
      <div className="flex flex-col h-screen p-4 bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md p-4 rounded-lg mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            🚗 Welcome to Smart Parking App
          </h1>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 gap-4">
          {/* Sidebar */}
          <div className="w-1/4 bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4  text-gray-700">Filters</h2>

            {/* Search Bar */}
            <input
              type="text"
              placeholder="🔍 Search for parking..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Filters */}
            <div className="space-y-2 text-black">
              <label className="flex items-center space-x-2 cursor-pointer hover:text-blue-600">
                <input
                  type="checkbox"
                  name="ev"
                  checked={filters.ev}
                  onChange={handleFilterChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>⚡ EV Charging</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="fourWheeler"
                  checked={filters.fourWheeler}
                  onChange={handleFilterChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>🚘 Four-Wheeler</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="twoWheeler"
                  checked={filters.twoWheeler}
                  onChange={handleFilterChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>🛵 Two-Wheeler</span>
              </label>
            </div>

            {/* Radius Filter */}
            <RangeSelect onRadiusChange={handleRadiusChange} />
          </div>

          {/* Map */}
          <div className="flex-1 bg-white shadow-md rounded-lg overflow-hidden">
            <GoogleMapView key={userLocation ? `${userLocation.lat}-${userLocation.lng}` : 'default'} filters={filters} radius={radius} />
          </div>
        </div>

        {/* Bookings Section */}
        <div className="mt-4 bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Your Bookings</h2>
          {loading ? (
            <p>Loading bookings...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-black">
                        Booking ID: {booking._id}
                      </p>
                      <p className="text-sm text-gray-500">
                        Vehicle Type: {booking.vehicleType}
                      </p>
                      <p className="text-sm text-gray-500">
                        Duration: {booking.duration} hours
                      </p>
                      <p className="text-sm text-gray-500">
                        Start Time: {new Date(booking.startTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        End Time: {new Date(booking.endTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {booking.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLocationContext.Provider>
  );
}