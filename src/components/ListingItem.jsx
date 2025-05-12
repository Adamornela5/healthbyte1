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
      
      {/* Everything linkable (image, text, health bar, tags) */}
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
          <p className="font-semibold text-xl truncate">{listing.name}</p>

          {/* Username display */}
          <p className="text-sm text-blue-500 truncate">@{username}</p>

          <p className="text-[#457b9d] font-semibold">
            🔥 {listing.calories?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Calories
          </p>
          <p className="text-sm text-gray-700">⭐ Health: {listing.healthRating}/10</p>

          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-green-500 h-1 rounded-full"
              style={{ width: `${(listing.healthRating / 10) * 100}%` }}
            ></div>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            {listing.healthRating <= 3
              ? "🧨 Treat Yo Self"
              : listing.healthRating <= 6
              ? "😌 Balanced"
              : "💪 Super Clean"}
          </p>

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

      {/* Like button goes OUTSIDE the Link! */}
      <div className="w-full px-[10px] pb-[10px]">
        <LikeButton
          listingId={id}
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

