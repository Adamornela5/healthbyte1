import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

export default function FollowButton({ targetUserId }) {
  const auth = getAuth();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 👤 Get logged-in user ID on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid || null);
    });
    return unsubscribe;
  }, [auth]);

  // 🔍 Check follow status on component mount or when user ID changes
  useEffect(() => {
    async function fetchFollowStatus() {
      if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;

      try {
        const userRef = doc(db, "users", currentUserId);
        const userSnap = await getDoc(userRef);
        const following = userSnap.data()?.following || [];
        setIsFollowing(following.includes(targetUserId));
      } catch (error) {
        console.error("Error fetching follow status:", error);
      }
    }

    fetchFollowStatus();
  }, [currentUserId, targetUserId]);

  // 🔁 Handle follow/unfollow action
  async function toggleFollow() {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;

    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);

    setLoading(true);
    try {
      if (isFollowing) {
        // ❌ Unfollow both ways
        console.log("Current user ID:", currentUserId);
        console.log("Target user ID:", targetUserId);
        console.log("Current user ref:", currentUserRef);
        await Promise.all([
          updateDoc(currentUserRef, {
            following: arrayRemove(targetUserId),
          }),
          updateDoc(targetUserRef, {
            followers: arrayRemove(currentUserId),
          }),
        ]);
        setIsFollowing(false);
      } else {
        // ✅ Follow both ways
        await Promise.all([
          updateDoc(currentUserRef, {
            following: arrayUnion(targetUserId),
          }),
          updateDoc(targetUserRef, {
            followers: arrayUnion(currentUserId),
          }),
        ]);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast.error("Failed to update follow status. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // 🚫 Don't show the button if not logged in or targeting self
  if (!currentUserId || currentUserId === targetUserId) return null;

  // 🔘 Render the Follow/Unfollow button
  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-3 py-1 rounded transition-colors duration-200 ${
        isFollowing ? "bg-blue-400 text-white" : "bg-gray-200 text-gray-700"
      } ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
    >
      {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
