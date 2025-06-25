import { Link } from "react-router-dom";
import notfound from "../../assets/img/404.jpg";

const NotFound = () => {
  return (
    <div className="relative w-screen h-screen bg-white">
      <img
        src={notfound}
        alt="Page not found"
        className="w-full h-full object-contain"
      />
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <Link
          to="/home"
          className="px-6 py-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover:bg-opacity-90 transition duration-300 shadow-md"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
