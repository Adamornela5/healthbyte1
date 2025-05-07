import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";

export default function Randomizer() {
  const [randomRecipe, setRandomRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [isLiked, setIsLiked] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    async function fetchRandomRecipe() {
      try {
        let listingsRef = collection(db, "listings");

        if (category !== "all") {
          listingsRef = query(listingsRef, where("type", "==", category));
        }

        const querySnap = await getDocs(listingsRef);
        const recipes = [];

        querySnap.forEach((doc) => {
          recipes.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        if (recipes.length > 0) {
          const randomIndex = Math.floor(Math.random() * recipes.length);
          const selected = recipes[randomIndex];
          setRandomRecipe(selected);

          // Check if user has liked this recipe
          if (auth.currentUser) {
            const likedBy = selected.data.likedBy || [];
            setIsLiked(likedBy.includes(auth.currentUser.uid));
          }
        } else {
          toast.info("No recipes found in this category");
        }

        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch recipes");
        setLoading(false);
      }
    }

    fetchRandomRecipe();
  }, [category, loading]);

  function generateRandom() {
    setLoading(true);
    setRandomRecipe(null);
  }

  async function toggleLike() {
    if (!auth.currentUser || !randomRecipe) return;

    const recipeRef = doc(db, "listings", randomRecipe.id);
    const userId = auth.currentUser.uid;

    try {
      await updateDoc(recipeRef, {
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
      });
      setIsLiked(!isLiked);
    } catch (error) {
      toast.error("Failed to update like");
      console.error(error);
    }
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      <h1 className="text-3xl text-center font-bold mb-6">Recipe Randomizer</h1>

      <div className="flex justify-center mb-8 gap-4">
        <button
          onClick={() => setCategory("all")}
          className={`px-4 py-2 rounded ${category === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Any Type
        </button>
        <button
          onClick={() => setCategory("healthy")}
          className={`px-4 py-2 rounded ${category === "healthy" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Healthy
        </button>
        <button
          onClick={() => setCategory("unhealthy")}
          className={`px-4 py-2 rounded ${category === "unhealthy" ? "bg-red-600 text-white" : "bg-gray-200"}`}
        >
          Unhealthy
        </button>      
        
        </div>

      <div className="flex flex-col items-center">
        <button
          onClick={generateRandom}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium mb-8 hover:bg-blue-700 transition"
        >
          Generate Random Recipe 
        </button>

        {randomRecipe ? (
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
            {randomRecipe.data.imgUrls && randomRecipe.data.imgUrls.length > 0 && (
              <img
                src={randomRecipe.data.imgUrls[0]}
                alt={randomRecipe.data.name}
                className="w-full h-80 object-cover rounded-md mb-4 mx-auto"
              />
            )}

            <h2 className="text-2xl font-bold mb-2">{randomRecipe.data.name}</h2>
            <p className="text-gray-600 mb-4">{randomRecipe.data.calories} calories</p>
            <p className="mb-4">{randomRecipe.data.description}</p>

            <div className="flex justify-between items-center mt-4">
              <span className={`px-3 py-1 rounded-full text-white ${
                randomRecipe.data.type === "healthy" ? "bg-green-500" : "bg-red-500"
              }`}>
                {randomRecipe.data.type}
              </span>

              <button
                onClick={toggleLike}
                className={`text-xl ${
                  isLiked ? "text-red-500" : "text-gray-400"
                } hover:text-red-600 transition`}
              >
                {isLiked ? "♥" : "♡"} Like
              </button>
            </div>

            <Link
              to={`/category/${randomRecipe.data.type}/${randomRecipe.id}`}
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              View Details
            </Link>
          </div>
        ) : (
          <p className="text-gray-500">No recipes available in this category</p>
        )}
      </div>
    </div>
  );
}
