import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import logo from "../assets/healthbytelong.png";

// Icons
import { FaHome, FaUtensils, FaUserCircle } from "react-icons/fa";

export default function Header() {
  const [pageState, setPageState] = useState("Sign in");
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setPageState(user ? "Profile" : "Sign in");
    });

    return () => unsubscribe(); // cleanup listener
  }, [auth]);

  function pathMatchRoute(route) {
    return route === location.pathname;
  }

  const handleProfileClick = () => {
    navigate(pageState === "Sign in" ? "/sign-in" : "/profile");
  };

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <button
            onClick={() => navigate("/")}
            className="overflow-hidden relative w-32 p-2 h-12 bg-white text-black border-none rounded-md text-xl font-bold cursor-pointer relative z-10 group"
          >
            HealthByte
            <span
              className="absolute w-36 h-32 -top-8 -left-2 bg-green-200 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-bottom"
            ></span>
            <span
              className="absolute w-36 h-32 -top-8 -left-2 bg-green-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-bottom"
            ></span>
            <span
              className="absolute w-36 h-32 -top-8 -left-2 bg-green-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-bottom"
            ></span>
            <span
              className="group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute top-2.5 left-6 z-10"
            >
              🏠Home
            </span>
          </button>
        </div>
        <ul className="flex space-x-6 items-center text-2xl text-gray-400">
          <li
            title="Home"
            className={`cursor-pointer p-2 rounded-full hover:text-black ${
              pathMatchRoute("/") && "text-black"
            }`}
            onClick={() => navigate("/")}
          >
            <FaHome />
          </li>
          <li
            title="Recipes"
            className={`cursor-pointer p-2 rounded-full hover:text-black ${
              pathMatchRoute("/recipes") && "text-black"
            }`}
            onClick={() => navigate("/recipes")}
          >
            <FaUtensils />
          </li>
          <li
            title={pageState}
            className={`cursor-pointer p-2 rounded-full hover:text-black ${
              (pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) &&
              "text-black"
            }`}
            onClick={handleProfileClick}
          >
            <FaUserCircle />
          </li>
        </ul>
      </header>
    </div>
  );
}
