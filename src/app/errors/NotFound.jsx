import React from "react";
import { Link } from "react-router-dom";
import notfound from "../../assets/img/404.jpg";

const NotFound = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <img
        src={notfound}
        alt="Page not found"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Link
          to="/home"
          className="px-6 py-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground transition duration-300 shadow-md"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
