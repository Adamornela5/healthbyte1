import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "../firebase"
import ListingItem from "../components/ListingItem"

export default function UserProfile() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [userListings, setUserListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserAndPosts() {
      try {
        // Fetch user profile data
        const userRef = doc(db, "users", userId)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          setUser(userSnap.data())
        } else {
          setUser(null)
        }

        // Fetch user's posts
        const listingsRef = collection(db, "listings")
        const listingsQuery = query(listingsRef, where("userRef", "==", userId), orderBy("timestamp", "desc"))
        const querySnap = await getDocs(listingsQuery)
        const listings = querySnap.docs.map(doc => ({ id: doc.id, data: doc.data() }))
        setUserListings(listings)
      } catch (error) {
        console.error("Failed to load profile or listings", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserAndPosts()
  }, [userId])

  if (loading) return <p className="text-center mt-10">Loading profile...</p>
  if (!user) return <p className="text-center mt-10">User not found.</p>

  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-4xl text-center mt-10 font-extrabold text-black tracking-tight drop-shadow-sm italic">
          {user.username}'s Profile
        </h1>

        <div className="text-center mt-2">

          <div className="flex gap-6 justify-center text-sm text-gray-600 mt-1">
            <div className="text-center">
              <p className="text-lg font-semibold">{user.followers?.length || 0}</p>
              <p>Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{user.following?.length || 0}</p>
              <p>Following</p>
            </div>
          </div>
        </div>
      </section>

      {/* User's Posts */}
      <div className="max-w-6xl px-3 mt-6 mx-auto">
        {userListings.length > 0 ? (
          <>
            <h2 className="text-2xl text-center font-semibold mt-6 mb-4 text-gray-800 tracking-wide underline decoration-wavy decoration-orange-400">
              🍽️ {user.username}'s Recipes
            </h2>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl-grid-cols-5 mt-6 mb-6">
              {userListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                  showActions={false} // Don't show edit/delete for other users
                />
              ))}
            </ul>
          </>
        ) : (
          <p className="text-center text-gray-500 mt-6">This user hasn't posted any recipes yet.</p>
        )}
      </div>
    </>
  )
}
