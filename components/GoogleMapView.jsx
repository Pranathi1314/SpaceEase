import { UserLocationContext } from "@/context/UserLocationContext";
import { GoogleMap, LoadScript, MarkerF } from "@react-google-maps/api";
import React, { useContext, useEffect, useState } from "react";
import GarageDetail from "./GarageDetail";

function GoogleMapView({ filters, radius }) {
  const { userLocation } = useContext(UserLocationContext);
  const [garages, setGarages] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null); // Store selected garage
  const [filteredGarages, setFilteredGarages] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Fetch garages from the database
  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const response = await fetch("/api/garages"); // Create this API route
        const data = await response.json();
        setGarages(data);
      } catch (error) {
        console.error("Failed to fetch garages:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchGarages();
  }, []);

  // Apply filters and radius whenever garages, filter values, or radius change
  useEffect(() => {
    const filtered = garages.filter((garage) => {
      // Check if the garage is within the radius
      const distance = getDistanceFromLatLonInKm(
        userLocation.lat,
        userLocation.lng,
        garage.location.latitude,
        garage.location.longitude
      );

      // Check if the garage matches the filters
      const matchesFilters =
        (!filters.ev || garage.ev > 0) && // EV parking available
        (!filters.fourWheeler || garage.fourWheeler > 0) && // 4-wheeler parking available
        (!filters.twoWheeler || garage.twoWheeler > 0); // 2-wheeler parking available

      return distance <= radius / 1000 && matchesFilters; // Convert radius to kilometers
    });

    setFilteredGarages(filtered);
  }, [garages, filters, radius, userLocation]);

  // Function to calculate distance between two coordinates in kilometers
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Function to determine the marker icon based on filters
  const getMarkerIcon = (garage) => {
    if (filters.ev && filters.fourWheeler && filters.twoWheeler && garage.fourWheeler > 0 && garage.twoWheeler > 0) {
      return "/ev-four-wheeler-two-wheeler-garage.png"; // Combined Four-Wheeler + Two-Wheeler icon
    }
    if (filters.ev && filters.fourWheeler && garage.ev > 0 && garage.fourWheeler > 0) {
      return "/ev-four-wheeler-garage.png"; // Combined EV + Four-Wheeler icon
    }
    if (filters.ev && filters.twoWheeler && garage.ev > 0 && garage.twoWheeler > 0) {
      return "/ev-two-wheeler-garage.png"; // Combined EV + Two-Wheeler icon
    }
    if (filters.fourWheeler && filters.twoWheeler && garage.fourWheeler > 0 && garage.twoWheeler > 0) {
      return "/four-wheeler-two-wheeler-garage.png"; // Combined Four-Wheeler + Two-Wheeler icon
    }
    if (filters.ev && garage.ev > 0) {
      return "/ev-garage.png"; // EV Charging icon
    }
    if (filters.fourWheeler && garage.fourWheeler > 0) {
      return "/four-wheeler-garage.png"; // Four-Wheeler icon
    }
    if (filters.twoWheeler && garage.twoWheeler > 0) {
      return "/two-wheeler-garage.png"; // Two-Wheeler icon
    }
    return "/regular-garage.png"; // Default icon
  };

  const containerStyle = {
    width: "100%",
    height: "500px",
  };

  return (
    <div>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        mapIds={["327f00d9bd231a33"]}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation || { lat: 37.7749, lng: -122.4194 }} // Default to San Francisco if no user location
          options={{
            mapId: "327f00d9bd231a33",
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
          }}
          zoom={13}
        >
          {/* User Location Marker */}
          {userLocation && (
            <MarkerF
              position={userLocation}
              icon={{
                url: "/user-location.png",
                scaledSize: {
                  width: 50,
                  height: 50,
                },
              }}
            />
          )}

          {/* Filtered Garage Markers */}
          {filteredGarages.map((garage) => (
            <MarkerF
              key={garage._id}
              position={{ lat: garage.location.latitude, lng: garage.location.longitude }}
              icon={{
                url: getMarkerIcon(garage), // Dynamic icon based on filters
                scaledSize: { width: 50, height: 50 },
              }}
              onClick={() => setSelectedGarage(garage)} // ✅ Set selected garage
            />
          ))}
        </GoogleMap>
      </LoadScript>

      {/* Display Garage Details */}
      {selectedGarage && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-1/2 max-w-[450px] text-black bg-white p-6 shadow-xl rounded-lg border border-gray-300 z-50 flex flex-col">
          <GarageDetail garage={selectedGarage} onClose={() => setSelectedGarage(null)} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-lg">Loading parking garages...</div>
        </div>
      )}

      {/* No Garages Found */}
      {!isLoading && filteredGarages.length === 0 && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 -z-10">
          <div className="text-white text-lg">No parking garages match your filters.</div>
        </div>
      )}
    </div>
  );
}

export default GoogleMapView;