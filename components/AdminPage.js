"use client"
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [pendingManagers, setPendingManagers] = useState([]);
  const [pendingGarages, setPendingGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("managers");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const managersResponse = await fetch('/api/admin/pending-managers');
        if (!managersResponse.ok) {
          throw new Error('Failed to fetch pending managers');
        }
        const managersData = await managersResponse.json();

        const garagesResponse = await fetch('/api/admin/pending-garages');
        if (!garagesResponse.ok) {
          throw new Error('Failed to fetch pending garages');
        }
        const garagesData = await garagesResponse.json();

        setPendingManagers(managersData);
        setPendingGarages(garagesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveManager = async (requestId) => {
    try {
      const response = await fetch('/api/admin/verify-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (!response.ok) {
        throw new Error('Failed to approve manager');
      }
      setPendingManagers(prev => prev.filter(req => req._id !== requestId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApproveGarage = async (garageId) => {
    try {
      const response = await fetch('/api/admin/verify-garage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ garageId }),
      });
      if (!response.ok) {
        throw new Error('Failed to approve garage');
      }
      setPendingGarages(prev => prev.filter(garage => garage._id !== garageId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-6">Loading pending requests...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("managers")}
          className={`px-4 py-2 rounded-md text-white transition ${activeTab === "managers" ? "bg-blue-600" : "bg-gray-500"}`}
        >
          Pending Managers
        </button>
        <button
          onClick={() => setActiveTab("garages")}
          className={`px-4 py-2 rounded-md text-white transition ${activeTab === "garages" ? "bg-blue-600" : "bg-gray-500"}`}
        >
          Pending Garages
        </button>
      </div>

      {activeTab === "managers" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Pending Manager Requests</h2>
          {pendingManagers.length === 0 ? (
            <p className="text-gray-600">No pending manager requests</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pendingManagers.map(request => (
                <div key={request._id} className="bg-white p-6 rounded-lg shadow text-center flex flex-col items-center w-52 h-52">
                  <p className="font-medium text-black">📧 {request.email}</p>
                  <p className="text-sm text-gray-500">⏳ {new Date(request.requestedAt).toLocaleString()}</p>
                  <button
                    onClick={() => handleApproveManager(request._id)}
                    className="mt-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    ✅ Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "garages" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Pending Garage Requests</h2>
          {pendingGarages.length === 0 ? (
            <p className="text-gray-600">No pending garage requests</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {pendingGarages.map(garage => (
                <div key={garage._id} className="bg-white p-6 rounded-lg shadow text-center flex flex-col items-center w-60 h-60">
                  <p className="font-medium text-black">🏠 {garage.name}</p>
                  <p className="text-sm text-gray-500">👤 {garage.managerId.email}</p>
                  <p className="text-sm text-gray-500">⏳ {new Date(garage.createdAt).toLocaleString()}</p>
                  <button
                    onClick={() => handleApproveGarage(garage._id)}
                    className="mt-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    ✅ Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
