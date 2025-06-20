import React from "react";
import maintenanceImg from "../../assets/img/maintenance.jpg"; // adjust path to your image

const Maintenance = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
        <img
          src={maintenanceImg}
          alt="Maintenance"
          className="w-48 h-48 mx-auto mb-6 animate-pulse"
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🚧 Under Maintenance 🚧
        </h1>
        <p className="text-gray-600 mb-1">
          We're improving your experience. Please check back shortly.
        </p>
        <p className="text-gray-500">Thanks for your patience. 🙏</p>
      </div>
    </div>
  );
};

export default Maintenance;
