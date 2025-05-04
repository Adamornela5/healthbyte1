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
        <p className="text-2xl font-bold mb-3 text-blue-900">
          {listing.name} {listing.calories
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",") // this is to convert for example 123456 to 123,456
                    } Calories
        </p>
      
      <div className="flex justify-start items-center space-x-4 w-[75%]">
                  <p className="bg-red-800 w-full max-w-[200px] rounded-md p-1 text-white text-center font-semibold shadow-md">
                    {listing.type === "healthy" ? "Healthy" : "Unhealthy"}
                  </p>             
      </div>

      <p className="mt-3 mb-3 break-words">
                  <span className="font-semibold">Description - </span>
                  {listing.description}
                  </p>
      
      </div>
      <div className="bg-blue-300 w-full h-[200px] lg-[400px] z-10 overflow-x-hidden">
      </div>
    </div>
  </main>
}
