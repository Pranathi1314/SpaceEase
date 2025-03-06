"use client";
import { Inter } from "next/font/google";
import "./globals.css";
// import { useRouter } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { UserLocationContext } from "@/context/UserLocationContext";
import { useEffect, useState } from 'react'
import { SelectedBusinessContext } from "@/context/SelectedBusinessContext";

const inter = Inter({ subsets: ["latin"] });

const onClick = () => {
  console.log("working");
};

export default function RootLayout({ children }) {
  const [userLocation, setUserLocation] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState([]);

  useEffect(() => {
    getUserLocation();
  }, []);
  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(function (pos) {
      console.log(pos);
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  };

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-white`}>
        {/* Navigation/Header */}
        <header className="flex justify-between items-center p-4 border-b bg-white">
          <div className="flex items-center">
            {/* Logo */}
            <div className="text-black font-semibold text-2xl">SpaceEase</div>
            <div className="text-gray-400 text-sm ml-2">User</div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <ClerkProvider>
            
              <UserLocationContext.Provider
                value={{ userLocation, setUserLocation }}
              >
                {children}
              </UserLocationContext.Provider>
          </ClerkProvider>
        </main>
      </body>
    </html>
  );
}
