"use client";
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { createGarage, getGaragesByManager } from "@/utils/actions/garageActions";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const ManagerPage = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("addGarage"); // Track active section
  const [garages, setGarages] = useState([]);
  const [garage, setGarage] = useState({
    name: "",
    location: null,
    fourWheeler: 0,
    fourWheelerPrice: 0,
    twoWheeler: 0,
    twoWheelerPrice: 0,
    ev: 0,
    evPrice: 0,
    managerEmail: "",
    photoUrl: "",   // Store photo URL here
    paperUrl: "",   // Store paper URL here
  });

  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  // Auto-set manager email when Clerk user loads
  useEffect(() => {
    console.log("Manager Email:", user.primaryEmailAddress?.emailAddress);
    if (user) {
      setGarage((prev) => ({
        ...prev,
        managerEmail: user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [user]);


  // useEffect(() => {
  //   if (mapContainer.current && !map.current) {
  //     map.current = new mapboxgl.Map({
  //       container: mapContainer.current,
  //       style: "mapbox://styles/mapbox/streets-v11",
  //       center: [72.8202, 19.1285], // Default 
  //       zoom: 12,
  //     });

  //     // Initialize Marker
  //     marker.current = new mapboxgl.Marker()
  //       .setLngLat([72.8202, 19.1285])
  //       .addTo(map.current);

  //     // Add Click-to-Set-Location Feature
  //     map.current.on("click", (e) => {
  //       const { lng, lat } = e.lngLat;
  //       setGarage((prev) => ({
  //         ...prev,
  //         location: { latitude: lat, longitude: lng }, // ✅ Store location
  //       }));
  //       marker.current.setLngLat([lng, lat]);
  //     });

  //     // ✅ Add Search Bar (Geocoder)
  //     const geocoder = new MapboxGeocoder({
  //       accessToken: mapboxgl.accessToken,
  //       mapboxgl: mapboxgl,
  //       marker: false, // Disable auto-marker (we control it manually)
  //       placeholder: "Search for a location...",
  //     });

  //     map.current.addControl(geocoder);

  //     // When user selects a location, update state and marker
  //     geocoder.on("result", (event) => {
  //       const coords = event.result.geometry.coordinates;
  //       setGarage((prev) => ({
  //         ...prev,
  //         location: { latitude: coords[1], longitude: coords[0] },
  //       }));
  //       marker.current.setLngLat(coords);
  //       map.current.flyTo({ center: coords, zoom: 14 }); // Smooth zoom to new location
  //     });
  //   }
  // }, []);

  // Initialize MapBox
  useEffect(() => {
    // Initialize the map only when the "Add Garage" tab is active
    if (activeTab === "addGarage" && mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [72.8202, 19.1285], // Default center
        zoom: 12,
      });
  
      // Initialize Marker
      marker.current = new mapboxgl.Marker()
        .setLngLat([72.8202, 19.1285])
        .addTo(map.current);
  
      // Add Click-to-Set-Location Feature
      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        setGarage((prev) => ({
          ...prev,
          location: { latitude: lat, longitude: lng }, // Store location
        }));
        marker.current.setLngLat([lng, lat]);
      });
  
      // Add Search Bar (Geocoder)
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false, // Disable auto-marker (we control it manually)
        placeholder: "Search for a location...",
      });
  
      map.current.addControl(geocoder);
  
      // When user selects a location, update state and marker
      geocoder.on("result", (event) => {
        const coords = event.result.geometry.coordinates;
        setGarage((prev) => ({
          ...prev,
          location: { latitude: coords[1], longitude: coords[0] },
        }));
        marker.current.setLngLat(coords);
        map.current.flyTo({ center: coords, zoom: 14 }); // Smooth zoom to new location
      });
    }
  
    // Cleanup function to destroy the map when the tab changes
    return () => {
      if (map.current) {
        map.current.remove(); // Remove the map instance
        map.current = null; // Reset the map reference
        marker.current = null; // Reset the marker reference
      }
    };
  }, [activeTab]); // Re-run this effect when activeTab changes



  // Fetch garages for the signed-in manager
  const fetchGarages = async () => {
    if (user) {
      const response = await fetch(`/api/users?clerkId=${user.id}`);
      const userData = await response.json();
      
      if (userData && userData._id) {
        const fetchedGarages = await getGaragesByManager(userData._id);
        setGarages(fetchedGarages);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
  
    if (type === "file") {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGarage((prevGarage) => ({
            ...prevGarage,
            [name]: reader.result,  // Assign to either 'photoUrl' or 'paperUrl'
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setGarage((prev) => ({
        ...prev,
        [name]: name === "fourWheeler" || name === "twoWheeler" || name === "ev" || name === "fourWheelerPrice" || name === "twoWheelerPrice" || name === "evPrice"
          ? Math.max(0, parseInt(value) || 0)
          : value,
      }));
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!garage.name.trim() || !garage.location || garage.fourWheeler < 0 || garage.fourWheelerPrice < 0 || garage.twoWheeler < 0 || garage.twoWheelerPrice < 0 || garage.ev < 0 || garage.evPrice < 0 || !garage.paperUrl) {
      alert("Please fill all fields correctly and upload necessary files.");
      return;
    }
  
    console.log("Submitted Garage Data:", garage);
  
    try {
      const response = await createGarage(garage);
      if (response?.success) {
        alert("Garage added successfully!");
        setGarage({
          name: "",
          location: null,
          fourWheeler: 0,
          fourWheelerPrice: 0,
          twoWheeler: 0,
          twoWheelerPrice: 0,
          ev: 0,
          evPrice: 0,
          managerEmail: user.primaryEmailAddress?.emailAddress || "",
          photoUrl: "",
          paperUrl: "",
        });
      } else {
        alert("Failed to add garage.");
      }
    } catch (error) {
      console.error("Error creating garage:", error);
      alert("An error occurred.");
    }
  };
  
  return (
    <main className="relative min-h-screen bg-white flex flex-col items-center">
      {/* 🚀 Navigation Bar */}
      <nav className="w-full bg-amber-400 text-black py-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-around font-semibold text-lg">
          <button className={`px-6 py-2 ${activeTab === "addGarage" ? "underline" : ""}`} onClick={() => setActiveTab("addGarage")}>
            Add Garage
          </button>
          <button className={`px-6 py-2 ${activeTab === "manageGarages" ? "underline" : ""}`} onClick={() => { setActiveTab("manageGarages"); fetchGarages(); }}>
            Manage Garages
          </button>
          <button className={`px-6 py-2 ${activeTab === "verifyRequests" ? "underline" : ""}`} onClick={() => setActiveTab("verifyRequests")}>
            Verify Requests
          </button>
        </div>
      </nav>

      {/* 🚀 Add Garage Section */}
      {/* 🚀 Add Garage Section */}
      {activeTab === "addGarage" && (
        <div className="p-8 w-full max-w-xl bg-white rounded-xl shadow-lg border border-gray-200 mt-6">
          <h2 className="text-3xl font-bold text-black text-center mb-6">Add New Garage</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="text" name="name" placeholder="Garage Name" className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-black" value={garage.name} onChange={handleChange} required />

            {/* MapBox for Location Selection */}
            <div className="w-full px-4 py-3 border border-grey-300 rounded-md shadow-sm text-black" style={{ position: "relative", width: "100%", height: "350px" }}>
              {/* Search Bar */}
              <div 
                id="geocoder"
                className="w-full px-4 py-3 border border-grey-300 rounded-md shadow-sm text-black"
                style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 1, width: "80%" }}>
              </div>

              {/* Map Container */}
              <div ref={mapContainer} style={{ width: "100%", height: "300px", borderRadius: "8px" }}></div>

              {/* Display Selected Location */}
              {garage.location && (
                <p className="text-sm text-black">
                  📍 Latitude: {garage.location.latitude} | Longitude: {garage.location.longitude}
                </p>
              )}
            </div>

            <div className="space-y-4 pt-36">
              {/* 4-Wheeler Capacity */}
              <div>
                <label htmlFor="fourWheeler" className="block text-sm font-medium text-black">
                  4-Wheeler Capacity
                </label>
                <input 
                  type="number" 
                  id="fourWheeler" 
                  name="fourWheeler" 
                  placeholder="Enter 4-Wheeler Capacity" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-black" 
                  value={garage.fourWheeler} 
                  onChange={handleChange} 
                  min="0" 
                  required 
                />
              </div>
              {/* 4-Wheeler Price */}
              <div>
                <label htmlFor="fourWheelerPrice" className="block text-sm font-medium text-black">
                  4-Wheeler Price
                </label>
                <input 
                  type="number" 
                  id="fourWheelerPrice" 
                  name="fourWheelerPrice" 
                  placeholder="Enter 4-Wheeler Price" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-black" 
                  value={garage.fourWheelerPrice} 
                  onChange={handleChange} 
                  min="0" 
                  required 
                />
              </div>

              {/* 2-Wheeler Capacity */}
              <div>
                <label htmlFor="twoWheeler" className="block text-sm font-medium text-black">
                  2-Wheeler Capacity
                </label>
                <input 
                  type="number" 
                  id="twoWheeler" 
                  name="twoWheeler" 
                  placeholder="Enter 2-Wheeler Capacity" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-black" 
                  value={garage.twoWheeler} 
                  onChange={handleChange} 
                  min="0" 
                  required 
                />
              </div>
              {/* 2-Wheeler Price */}
              <div>
                <label htmlFor="twoWheelerPrice" className="block text-sm font-medium text-black">
                  2-Wheeler Price
                </label>
                <input 
                  type="number" 
                  id="twoWheelerPrice" 
                  name="twoWheelerPrice" 
                  placeholder="Enter 2-Wheeler Slot Price" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-black" 
                  value={garage.twoWheelerPrice} 
                  onChange={handleChange} 
                  min="0" 
                  required 
                />
              </div>

              {/* EV Capacity */}
              <div>
                <label htmlFor="ev" className="block text-sm font-medium text-black">
                  EV Capacity
                </label>
                <input 
                  type="number" 
                  id="ev" 
                  name="ev" 
                  placeholder="Enter EV Capacity" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-black" 
                  value={garage.ev} 
                  onChange={handleChange} 
                  min="0" 
                  required 
                />
              </div>
              {/* EV Price */}
              <div>
                <label htmlFor="evPrice" className="block text-sm font-medium text-black">
                  EV Slot Price
                </label>
                <input 
                  type="number" 
                  id="evPrice" 
                  name="evPrice" 
                  placeholder="Enter EV Slot Price" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-black" 
                  value={garage.evPrice} 
                  onChange={handleChange} 
                  min="0" 
                  required 
                />
              </div>
              {/* Garage Photo */}
              <div>
                <label className="block text-sm font-medium text-black">Garage Photo</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  name="photoUrl" 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                {garage.photoUrl && <img src={garage.photoUrl} alt="Garage" className="mt-2 w-full h-32 object-cover rounded" />}
              </div>

              <div>
                <label className="block text-sm font-medium text-black">Garage Paper (PDF/Image)</label>
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  name="paperUrl" 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                {garage.paperUrl && <p className="mt-2 text-sm text-black">File uploaded</p>}
              </div>
            </div>

            <button type="submit" className="w-full px-6 py-3 bg-yellow-500 text-black font-bold rounded-md shadow-md hover:bg-yellow-600 transition">
              Add Garage
            </button>
          </form>
        </div>
      )}

      {/* 🚀 Manage Garages Section */}
      {activeTab === "manageGarages" && (
        <div className="p-8 w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-200 mt-6">
          <h2 className="text-3xl font-bold text-black text-center mb-6">Your Garages</h2>
          <div className="space-y-4">
            {garages.length > 0 ? (
              garages.map((garage) => (
                <div key={garage._id} className="p-4 border rounded-lg shadow-sm bg-gray-100">
                  <h3 className="text-2xl font-semibold text-black">{garage.name}</h3>

                  {/* 🌍 Display Location (Latitude & Longitude) */}
                  <p className="text-gray-700">
                    📍 Location: {garage.location.latitude}, {garage.location.longitude}
                  </p>

                  {/* 🚗 Parking Capacities */}
                  <p className="text-gray-700">🚘 Four Wheeler Slots: {garage.fourWheeler}</p>
                  <p className="text-gray-700">🚘 Four Wheeler Slot Price: {garage.fourWheelerPrice}</p>
                  <p className="text-gray-700">🏍️ Two Wheeler Slots: {garage.twoWheeler}</p>
                  <p className="text-gray-700">🏍️ Two Wheeler Slot Price: {garage.twoWheelerPrice}</p>
                  <p className="text-gray-700">⚡ EV Slots: {garage.ev}</p>
                  <p className="text-gray-700">⚡ EV Slot Price: {garage.evPrice}</p>

                  {/* 👨‍💼 Manager Details */}
                  <p className="text-gray-700">
                    👤 Manager ID: {garage.managerId ? garage.managerId.toString() : "N/A"}
                  </p>

                  {/* ✅ Verification Status */}
                  <p className={`font-semibold ${garage.verified ? "text-green-600" : "text-red-600"}`}>
                    {garage.verified ? "✅ Verified" : "❌ Not Verified"}
                  </p>

                  {/* 🕒 Created At */}
                  <p className="text-gray-500">📅 Added On: {new Date(garage.createdAt).toLocaleDateString()}</p>

                  {/* 🏞️ Display Garage Photo */}
                  {garage.photoUrl && (
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold text-black">Garage Photo(s):</h4>
                      <img 
                        src={garage.photoUrl} 
                        alt="Garage Photo" 
                        className="mt-2 w-full max-w-xs h-auto rounded-lg border border-gray-300 shadow-sm"
                      />
                    </div>
                  )}

                  {/* 📄 Display Paper Document */}
                  {garage.paperUrl && (
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold text-black">Garage Registration Papers:</h4>
                      <a 
                        href={garage.paperUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                      >
                        📄 View Garage Registration papers
                      </a>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No garages found.</p>
            )}
          </div>
        </div>
      )}

      {/* 🚀 Verify Requests Section (Blank for now) */}
      {activeTab === "verifyRequests" && (
        <div className="p-8 w-full max-w-xl bg-white rounded-xl shadow-lg border border-gray-200 mt-6">
          <h2 className="text-3xl font-bold text-black text-center mb-6">Verify User Parking Requests</h2>
          <p className="text-gray-500 text-center">This section will be implemented later.</p>
        </div>
      )}
    </main>
  );
};

export default ManagerPage;