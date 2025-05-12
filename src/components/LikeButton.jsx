import { useState } from "react";
import { updateDoc, doc, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";

export default function LikeButton({ listingId, initialCount, initialLiked }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const [likeCount, setLikeCount] = useState(initialCount || 0);
  const [hasLiked, setHasLiked] = useState(initialLiked || false);

  async function toggleLike() {
    if (!user) {
      // Optionally prompt login
      return;
    }

    const listingRef = doc(db, "listings", listingId);
    const userRef = doc(db, "users", user.uid);

    try {
      if (hasLiked) {
        // Unlike flow
        await updateDoc(listingRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid),
        });

        await updateDoc(userRef, {
          likedPosts: arrayRemove(listingId),
        });

        setLikeCount((prev) => prev - 1);
        setHasLiked(false);

      } else {
        // Like flow
        await updateDoc(listingRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid),
        });

        await updateDoc(userRef, {
          likedPosts: arrayUnion(listingId),
        });

        setLikeCount((prev) => prev + 1);
        setHasLiked(true);
      }

    } catch (error) {
      console.error("Error updating like:", error);
    }
  }

  return (
    <button
      onClick={toggleLike}
      className={`px-3 py-1 rounded ${
        hasLiked ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
      }`}
    >
      {hasLiked ? "♥ Liked" : "♡ Like"} {likeCount}
    </button>
  );
}
