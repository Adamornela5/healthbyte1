import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { getAuth } from "firebase/auth";

export default function Randomizer() {
  const [randomListing, setRandomListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const auth = getAuth();

  useEffect(() => {
    fetchRandomListing();
  }, [category]);

  async function fetchRandomListing() {
    setLoading(true);
    setRandomListing(null);

    try {
      let listingsRef = collection(db, "listings");

      if (category !== "all") {
        listingsRef = query(listingsRef, where("type", "==", category));
      }

      const querySnap = await getDocs(listingsRef);
      const listings = [];

      querySnap.forEach((doc) => {
        listings.push({ id: doc.id, data: doc.data() });
      });

      if (listings.length === 0) {
        toast.info("No recipes found in this category");
        setLoading(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * listings.length);
      setRandomListing(listings[randomIndex]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Could not fetch recipes");
      setLoading(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      <h1 className="text-3xl text-center font-bold mb-6">Recipe Randomizer</h1>

      {/* Category Filter Buttons */}
      <div className="flex justify-center mb-2 gap-4">
        {["all", "healthy", "unhealthy"].map((type) => (
          <button
            key={type}
            onClick={() => setCategory(type)}
            className={`px-4 py-2 rounded ${
              category === type ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {type === "all" ? "Any Type" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <div className="flex flex-col items-center">
        {/* Display the Random Listing */}
        {randomListing ? (
          <ul className="sm:grid sm:grid-cols-1 mt-6 mb-6">
            <ListingItem
              key={randomListing.id}
              id={randomListing.id}
              listing={randomListing.data}
              showActions={false}
            />
          </ul>
        ) : (
          <p className="text-gray-500">No recipes available in this category</p>
        )}
        
       
<button
  onClick={fetchRandomListing}
  class="relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-white bg-gray-800 rounded-md group"
>
  <span
    class="absolute w-0 h-0 transition-all duration-500 ease-out bg-blue-600 rounded-full group-hover:w-56 group-hover:h-56"
  ></span>
  <span class="absolute bottom-0 left-0 h-full -ml-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-auto h-full opacity-100 object-stretch"
      viewBox="0 0 487 487"
    >
      <path
        fill-opacity=".1"
        fill-rule="nonzero"
        fill="#FFF"
        d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"
      ></path>
    </svg>
  </span>
  <span class="absolute top-0 right-0 w-12 h-full -mr-3">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="object-cover w-full h-full"
      viewBox="0 0 487 487"
    >
      <path
        fill-opacity=".1"
        fill-rule="nonzero"
        fill="#FFF"
        d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"
      ></path>
    </svg>
  </span>
  <span
    class="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-200"
  ></span>
  <span class="relative text-base font-semibold">    Next    </span>
</button>



  
      </div>
    </div>
  );
}

