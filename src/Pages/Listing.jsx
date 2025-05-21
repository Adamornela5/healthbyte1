import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import Spinner from "../components/Spinner"
import {EffectFade, Autoplay, Navigation, Pagination} from "swiper/modules"

import {Swiper, SwiperSlide} from "swiper/react"

import "swiper/css/bundle"
import "swiper/css/navigation"
import "swiper/css/pagination"

import { FaShare } from "react-icons/fa";

import LikeButton from "../components/LikeButton"
import { getAuth } from "firebase/auth" // For the like button cause we need to check if they are authenticated or not

export default function Listing() {

    const params = useParams()
    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)
    
    useEffect(()=>{
        async function fetchListing(){
          const docRef = doc(db, "listings", params.listingId)
          const docSnap = await getDoc(docRef)
          if(docSnap.exists()){
            setListing(docSnap.data())
            setLoading(false)
            
          }
        }
        fetchListing()
    },[params.listingId])
    if(loading){
      return<Spinner></Spinner>
    }
  return <main>
    <Swiper  
    modules={[EffectFade, Autoplay, Navigation, Pagination]}
    slidesPerView={1} 
    navigation 
    pagination={{type: "progressbar"}}
    effect="fade" 
    autoplay={{delay: 3000}}>
      {listing.imgUrls.map((url, index)=>(
        <SwiperSlide key={index}>
          <div
            className="relative w-full overflow-hidden h-[300px]"
            style={{
                  backgroundImage: `url(${listing.imgUrls[index]})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover", // Ensures image covers the whole div
                  backgroundRepeat: "no-repeat", // Prevents tiling
                }}
        >

        </div>
        </SwiperSlide>
      ))}
    </Swiper>
    <div className="fixed top-[13%] right-[3%] z-10 bg-white cursor-pointer border-2 border-gray-400 rounded-full w-12 h-12 flex justify-center items-center" onClick={()=>{
      navigator.clipboard.writeText(window.location.href)
      setShareLinkCopied(true)
      setTimeout(()=>{
        setShareLinkCopied(false);
      }, 2000)
    }}>
      <FaShare className="text-lg text-slate-500" />
    </div>
    {shareLinkCopied && (
      <p className="fixed top-[23%] right-[5%] font-semibold border-2 border-gray-400 rounded-md bg-white z-10 p-2">LinkCopied</p>
    )}

    <div className="m-4 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded shadow-lg bg-white lg:space-x-5 overflow-hidden">
      <div className="w-full">
        

      {/* Title */}
<div className="w-full mb-2">
  <h1 className="text-2xl font-bold text-blue-900">{listing.name}</h1>
</div>

{/* Health Bar */}
<div className="w-full mb-1">
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-green-500 h-2 rounded-full"
      style={{ width: `${(listing.healthRating / 10) * 100}%` }}
    ></div>
  </div>
</div>

{/* Health Style (🧨, 😌, 💪) */}
<p className="text-xs text-gray-500 mb-2">
  {listing.healthRating <= 3
    ? "🧨 Treat Yo Self"
    : listing.healthRating <= 6
    ? "😌 Balanced"
    : "💪 Super Clean"}
</p>

{/* Calories + Type + Like */}
<div className="flex items-center space-x-4 mb-4">
  <span className="text-[#457b9d] font-semibold">
    🔥 {listing.calories?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Calories
  </span>

  <span className={`px-3 py-1 rounded-full text-white ${listing.type === "healthy" ? "bg-green-500" : "bg-red-500"}`}>
    {listing.type}
  </span>

  <LikeButton
    listingId={params.listingId}
    initialCount={listing.likes || 0}
    initialLiked={(listing.likedBy || []).includes(getAuth().currentUser?.uid)}
  />
</div>

 

      <p className="mt-3 mb-3 break-words">
                  <span className="font-semibold">Description - </span>
                  {listing.description}
                  </p>
      
      </div>
    </div>
  </main>
}
