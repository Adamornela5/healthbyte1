import { useEffect, useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import { CiForkAndKnife } from "react-icons/ci";
import ListingItem from "../components/ListingItem";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();

  // Local state
  const [changeDetail, setChangeDetail] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null); // 🔑 Store full user data
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loadingLikedRecipes, setLoadingLikedRecipes] = useState(true);

  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const { name, email } = formData;

  function onLogout() {
    auth.signOut();
    navigate("/");
  }

  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }

  async function onSubmit() {
    try {
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, { displayName: name });
        const docRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(docRef, { name });
      }
      toast.success("Profile details updated");
    } catch (error) {
      toast.error("Could not update the profile");
    }
  }

  useEffect(() => {
    async function fetchUsername() {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUsername(data.username || "");
        setUserData(data); // ✅ Save full user document for follower/following info
      }
    }

    async function fetchUserListings() {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      const listingsData = querySnap.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setListings(listingsData);
      setLoading(false);
    }

    fetchUsername();
    fetchUserListings();
  }, [auth.currentUser.uid]);

  useEffect(() => {
    async function fetchLikedRecipes() {
      try {
        const likedRecipesQuery = query(
          collection(db, "listings"),
          where("likedBy", "array-contains", auth.currentUser.uid)
        );
        const likedRecipesSnapshot = await getDocs(likedRecipesQuery);
        const likedRecipesData = likedRecipesSnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
        setLikedRecipes(likedRecipesData);
      } catch (error) {
        console.error("Failed to fetch liked recipes", error);
        toast.error("Failed to fetch liked recipes");
      } finally {
        setLoadingLikedRecipes(false);
      }
    }

    fetchLikedRecipes();
  }, [auth.currentUser.uid]);

  async function onDelete(listingID) {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteDoc(doc(db, "listings", listingID));
      const updatedListings = listings.filter((listing) => listing.id !== listingID);
      setListings(updatedListings);
      toast.success("Successfully deleted the listing");
    }
  }

  function onEdit(listingID) {
    navigate(`/edit-recipe/${listingID}`);
  }

  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-4xl text-center mt-10 font-extrabold text-black tracking-tight drop-shadow-sm italic">
          My Profile
        </h1>

        <div className="text-center mt-2">
          <p className="text-md text-blue-600">@{username}</p>
          <div className="flex gap-6 justify-center text-sm text-gray-600 mt-1">
            <div className="text-center">
              <p className="text-lg font-semibold">{userData?.followers?.length || 0}</p>
              <p>Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{userData?.following?.length || 0}</p>
              <p>Following</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
            <button
              onClick={() => setShowDetails((prev) => !prev)}
              className="w-[200px] bg-blue-600 text-white uppercase px-4 py-3 text-sm font-medium
                rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg
                active:bg-blue-800"
            >
              {showDetails ? "Hide Settings ▲" : "Show Settings ▼"}
            </button>

            <Link to="/create-meal">
              <button
                type="button"
                className="w-[200px] bg-blue-600 text-white uppercase px-4 py-3 text-sm font-medium
                  rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg
                  active:bg-blue-800 flex items-center justify-center"
              >
                <CiForkAndKnife className="mr-2 text-2xl" />
                Create Meal
              </button>
            </Link>
        </div>


        {showDetails && (
          <div className="w-full md:w-[50%] mt-6 px-3">
            <form>
              <input
                type="text"
                id="name"
                value={name}
                disabled={!changeDetail}
                onChange={onChange}
                className={`mb-6 w-full px-4 py-2 text-xl 
                  text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out ${
                    changeDetail && "bg-red-200 focus:bg-red-200"
                  }`}
              />
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="mb-6 w-full px-4 py-2 text-xl 
                  text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"
              />

              <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
                <p className="flex items-center mb-6">
                  Do you want to change your name?
                  <span
                    onClick={() => {
                      changeDetail && onSubmit();
                      setChangeDetail((prevState) => !prevState);
                    }}
                    className="text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer"
                  >
                    {changeDetail ? "Apply change" : "Edit"}
                  </span>
                </p>
                <p
                  onClick={onLogout}
                  className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out cursor-pointer"
                >
                  Sign out
                </p>
              </div>
            </form>
          </div>
        )}

      </section>

      {/* My Recipes */}
      <div className="max-w-6xl px-3 mt-6 mx-auto">
        {!loading && listings.length > 0 && (
          <>
            <h2 className="text-2xl text-center font-semibold mt-6 mb-4 text-gray-800 tracking-wide underline decoration-wavy decoration-orange-400">
              🍳 My Recipes
            </h2>

            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl-grid-cols-5 mt-6 mb-6">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Liked Recipes */}
      <div className="max-w-6xl px-3 mt-6 mx-auto">
        {!loadingLikedRecipes && likedRecipes.length > 0 && (
          <>
            <h2 className="text-2xl text-center font-semibold mt-6 mb-4 text-gray-700 italic">❤️ Liked Recipes</h2>

            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl-grid-cols-5 mt-6 mb-6">
              {likedRecipes.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                  showActions={false}
                />
              ))}
            </ul>
          </>
        )}
        {!loadingLikedRecipes && likedRecipes.length === 0 && (
          <p className="text-center text-gray-500 mt-6">You haven't liked any recipes yet.</p>
        )}
      </div>
    </>
  );
}
