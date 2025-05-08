import { useLocation, useNavigate } from "react-router-dom";
import logo from '../assets/healthbytelong.png'
import{getAuth, onAuthStateChanged} from "firebase/auth"
import { useEffect, useState } from "react";
export default function Header() { 
  const [pageState, setPageState] = useState("Sign in")
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  useEffect(()=>{
    onAuthStateChanged(auth, (user)=>{
      if(user){
        setPageState("Profile");
      }else {
        setPageState("Sign in");
      }
    })
  }, [auth])
  function pathMatchRoute(route) {
    if (route === location.pathname) {
      return true;
    }
  }
  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img
            src={logo}
            alt="logo"
            className="h-10 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <div>
          <ul className="flex space-x-10">
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute("/") && "text-black border-b-red-500"
              }`} 
              onClick={() => navigate("/")}
            >
              Home
            </li>
            {/*<li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute("/recipes") && "text-black border-b-red-500"
              }`}
              onClick={() => navigate("/recipes")}
            >
              Recipes
            </li>*/}
            <li
               className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute("/randomizer") && "text-black border-b-red-500"
               }`}
               onClick={() => navigate("/randomizer")}
            >
              Randomizer
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                (pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) && "text-black border-b-red-500"
              }`}
              onClick={() => navigate("profile")} // for some reason using "sign-in" was throwing an error
            >
              {pageState}
            </li>
          </ul>
        </div>
      </header>
    </div>
  );
}