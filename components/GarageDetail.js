"use client"
import { useRouter } from "next/navigation";

const GarageDetail = ({ garage, onClose }) => {
  // Function to handle "Get Directions" button click

  const router = useRouter();

  const handleBookSpot = () => {
    const query = new URLSearchParams({
      id: garage._id,
      name: garage.name,
      location: garage.location,
      availableTwoWheeler: garage.twoWheeler-garage.bookedTwoWheeler,
      twoWheelerPrice: garage.twoWheelerPrice,
      availableFourWheeler: garage.fourWheeler-garage.bookedFourWheeler,
      fourWheelerPrice: garage.fourWheelerPrice,
      availableEV: garage.ev - garage.bookedEV,
      evPrice : garage.evPrice
    }).toString();

    router.push(`/book-parking?${query}`);
  };

  const handleGetDirections = () => {
    if (navigator.geolocation) {
      // Get user's current location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Construct Google Maps URL
          const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${garage.location.latitude},${garage.location.longitude}`;

          // Open Google Maps in a new tab
          window.open(googleMapsUrl, "_blank");
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert("Unable to get your current location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-xl bg-white flex flex-col w-full">
      {/* Close Button */}
      <button className="self-end text-red-500 font-bold" onClick={onClose}>
        Close ❌
      </button>

      {/* Garage Image */}
      {garage.photoUrl && (
        <img
          src={garage.photoUrl}
          alt="Garage"
          className="w-full max-h-52 object-cover rounded-md border items-center border-gray-300 shadow-sm"
        />
      )}

      {/* Garage Details */}
      <h2 className="text-xl font-bold mt-3">{garage.name}</h2>
      <p className="text-gray-600">
        📍Location: {garage.location.latitude}, {garage.location.longitude}
      </p>
      <p className="text-gray-600">
        EV Support: {garage.ev > 0 ? "⚡ Yes" : "❌ No"}
      </p>

      {/* Spots Available Section */}
      <div className="mt-4 w-full">
        <h3 className="text-lg font-semibold">Available Spots:</h3>
        <ul className="list-disc pl-5 text-gray-700">
          {garage.fourWheeler !== undefined && (
            <li>🚗 Four-wheeler: {garage.fourWheeler} spots</li>
          )}
          {garage.fourWheelerPrice !== undefined && (
            <p>Price per hour: {garage.fourWheelerPrice} Rs</p>
          )}
          {garage.twoWheeler !== undefined && (
            <li>🏍️ Two-wheeler: {garage.twoWheeler} spots</li>
          )}
          {garage.twoWheelerPrice !== undefined && (
            <p>Price per hour: {garage.twoWheelerPrice} Rs</p>
          )}
          {garage.ev !== undefined && (
            <li>⚡ EV Charging : {garage.ev} spots</li>
          )}
          {garage.evPrice !== undefined && (
            <p>Price per hour: {garage.evPrice} Rs</p>
          )}
        </ul>
      </div>

      {/* Get Directions Button */}
      <button
        onClick={handleGetDirections}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
      >
        🗺️ Get Directions
      </button>

      <button
        onClick={handleBookSpot}
        className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
      >
        Book a Parking Spot
      </button>

    </div>
  );
};

export default GarageDetail;