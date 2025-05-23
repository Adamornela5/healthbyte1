import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import LikeButton from "./LikeButton";

export default function ListingItem({ listing, id, onEdit, onDelete }) {
  const auth = getAuth();
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function fetchUsername() {
      if (listing.userRef) {
        try {
          const userDoc = await getDoc(doc(db, "users", listing.userRef));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || "unknown");
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      }
    }

    fetchUsername();
  }, [listing.userRef]);

  return (
    <li className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">

      {/* Linkable content */}
      <Link to={`/category/${listing.type}/${id}`} className="w-full">
        <img
          className="h-[170px] w-full object-cover hover:scale-105 transition-scale duration-200 ease-in"
          loading="lazy"
          src={listing.imgUrls?.[0]}
          alt={listing.name}
        />
        <p className="absolute top-2 left-2 bg-[#3377cc] text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg">
          {moment(listing.timestamp?.toDate()).fromNow()}
        </p>

        <div className="w-full p-[10px] space-y-2">
          {/* Title */}
          <p className="font-semibold text-xl truncate">{listing.name}</p>

          {/* Health Bar under title */}
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-green-500 h-1 rounded-full"
              style={{ width: `${(listing.healthRating / 10) * 100}%` }}
            ></div>
          </div>

          {/* Username & Follow Button */}
          <div className="flex items-center gap-2 px-[10px] pt-2 w-full">
            <Link
              to={`/user/${listing.userRef}`}
              className="text-sm text-blue-500 hover:underline truncate"
              onClick={(e) => e.stopPropagation()} // prevent bubbling into the main Link
            >
              @{username}
            </Link>
          </div>

          {/* Calories */}
          <p className="text-[#457b9d] font-semibold">
            🔥 {listing.calories?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Calories
          </p>

          {/* Health Style */}
          <p className="text-xs text-gray-500 mt-1">
            {listing.healthRating <= 3
              ? "🧨 Treat Yo Self"
              : listing.healthRating <= 6
              ? "😌 Balanced"
              : "💪 Super Clean"}
          </p>

          {/* Tags */}
          {listing.tags && (
            <div className="flex flex-wrap gap-1 mt-1">
              {listing.tags.split(" ").map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1"
                >
                  {tag.replace(/^#/, "")}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Like button only (outside the Link) */}
      <div
        className="w-full px-[10px] pb-[10px] flex justify-start"
        onClick={(e) => e.stopPropagation()}
      >
      
        <LikeButton
          listingId={id}
          targetUserId={listing.userRef} // ✅ Pass correct user ID
          initialCount={listing.likes || 0}
          initialLiked={(listing.likedBy || []).includes(auth.currentUser?.uid)}
        />

      </div>

      {/* Optional Edit/Delete buttons */}
      {onDelete && (
        <FaTrash
          className="absolute bottom-2 right-2 h-[14px] cursor-pointer text-red-500"
          onClick={() => onDelete(listing.id)}
        />
      )}
      {onEdit && (
        <MdEdit
          className="absolute bottom-2 right-7 h-4 cursor-pointer"
          onClick={() => onEdit(listing.id)}
        />
      )}
    </li>
  );
}
