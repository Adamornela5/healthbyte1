import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import { db } from "../firebase"
import Spinner from "../components/Spinner"
import { EffectFade, Autoplay, Navigation, Pagination } from "swiper/modules"
import LikeButton from "../components/LikeButton"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css/bundle"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { FaShare } from "react-icons/fa"
import { getAuth } from "firebase/auth"

export default function Listing() {
  const auth = getAuth()
  const params = useParams()
  const id = params.listingId

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareLinkCopied, setShareLinkCopied] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchListing() {
      const docRef = doc(db, "listings", id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        const normalizedComments = (data.comments || []).map((comment) => ({
          ...comment,
          timestamp: comment.timestamp?.toDate
            ? comment.timestamp.toDate()
            : comment.timestamp,
        }))
        setListing(data)
        setComments(normalizedComments)
        setLoading(false)
      }
    }
    fetchListing()
  }, [id])

  const handleDelete = async (commentId) => {
    const updatedComments = comments.filter((c) => c.commentId !== commentId)
    setComments(updatedComments)
    await updateDoc(doc(db, "listings", id), {
      comments: updatedComments,
    })
  }

  const handleEdit = async (commentId, newText) => {
    const updatedComments = comments.map((c) =>
      c.commentId === commentId ? { ...c, text: newText } : c
    )
    setComments(updatedComments)
    await updateDoc(doc(db, "listings", id), {
      comments: updatedComments,
    })
  }

  if (loading) return <Spinner />

  return (
    <main>
      <Swiper
        modules={[EffectFade, Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        navigation
        pagination={{ type: "progressbar" }}
        effect="fade"
        autoplay={{ delay: 3000 }}
      >
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative w-full overflow-hidden h-[300px]"
              style={{
                backgroundImage: `url(${url})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className="fixed top-[13%] right-[3%] z-10 bg-white cursor-pointer border-2 border-gray-400 rounded-full w-12 h-12 flex justify-center items-center"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href)
          setShareLinkCopied(true)
          setTimeout(() => setShareLinkCopied(false), 2000)
        }}
      >
        <FaShare className="text-lg text-slate-500" />
      </div>

      {shareLinkCopied && (
        <p className="fixed top-[23%] right-[5%] font-semibold border-2 border-gray-400 rounded-md bg-white z-10 p-2">
          Link Copied
        </p>
      )}

      <div className="m-4 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded shadow-lg bg-white lg:space-x-5 overflow-hidden">
        <div className="w-full">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">{listing.name}</h1>

          <div className="w-full mb-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(listing.healthRating / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-2">
            {listing.healthRating <= 3
              ? "🧨 Treat Yo Self"
              : listing.healthRating <= 6
              ? "😌 Balanced"
              : "💪 Super Clean"}
          </p>

          <div className="flex items-center space-x-4 mb-4">
            <span className="text-[#457b9d] font-semibold">
              🔥 {listing.calories?.toLocaleString()} Calories
            </span>
            <span
              className={`px-3 py-1 rounded-full text-white ${
                listing.type === "healthy" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {listing.type}
            </span>

            <LikeButton
              listingId={id}
              targetUserId={listing.userRef}
              initialCount={listing.likes || 0}
              initialLiked={(listing.likedBy || []).includes(auth.currentUser?.uid)}
            />
          </div>

          <p className="mt-3 mb-3 break-words">
            <span className="font-semibold">Description - </span>
            {listing.description}
          </p>

          {/* Comments Section */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>

            {comments.length === 0 ? (
              <p className="text-gray-500">No comments yet. Be the first!</p>
            ) : (
              comments.map((c) => (
                <div key={c.commentId} className="mb-3 p-3 border rounded">
                  <p className="text-sm text-gray-600">
                    <strong>{c.username}</strong>{" "}
                    <span className="text-xs">
                      {c.timestamp
                        ? new Date(c.timestamp).toLocaleString()
                        : "Just now"}
                    </span>
                  </p>
                  <p className="mt-1 break-words">{c.text}</p>
                  {auth.currentUser?.uid === c.userId && (
                    <div className="mt-1 space-x-2 text-sm">
                      <button
                        onClick={() => {
                          const newText = prompt("Edit your comment:", c.text)
                          if (newText && newText.trim().length <= 280) {
                            handleEdit(c.commentId, newText.trim())
                          }
                        }}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.commentId)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

            {auth.currentUser && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (submitting || newComment.trim().length === 0 || newComment.length > 280) return
                  setSubmitting(true)

                  const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid))
                  const userData = userDoc.exists() ? userDoc.data() : {}

                  const commentObj = {
                    commentId: `${auth.currentUser.uid}_${Date.now()}`,
                    userId: auth.currentUser.uid,
                    username: userData.username || "Anonymous",
                    text: newComment.trim(),
                    timestamp: new Date(),
                  }

                  const ref = doc(db, "listings", id)
                  await updateDoc(ref, {
                    comments: arrayUnion(commentObj),
                  })

                  setComments((prev) => [...prev, commentObj])
                  setNewComment("")
                  setSubmitting(false)
                }}
                className="mt-4 flex flex-col space-y-2"
              >
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={280}
                  className="p-2 border rounded"
                  placeholder="Write your comment… (max 280 chars)"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting || newComment.trim().length === 0}
                  className="self-end px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}