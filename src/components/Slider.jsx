import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import Spinner from "../components/Spinner";


import {EffectFade, Autoplay, Navigation, Pagination} from "swiper/modules"

import {Swiper, SwiperSlide} from "swiper/react"

import "swiper/css/bundle"
import { useNavigate } from "react-router-dom";

export default function Slider() {
    const [listings, setListings] = useState(null)
      const [loading, setLoading] = useState(true)
      const navigate = useNavigate()
      useEffect(()=>{
        async function fetchListings(){
          const listingsRef = collection(db, "listings")
          const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5))
          const querySnap = await getDocs(q)
          let listings = []
          querySnap.forEach((doc)=>{
            return listings.push({
              id: doc.id,
              data: doc.data(),
            })
          })
          setListings(listings)
          setLoading(false)
        }
        fetchListings()
      }, [])
      if(loading){
        return <Spinner/>
      }
      if(listings.length === 0){
        return <></>
      }
  return (  
    listings && <>
    <Swiper
    modules={[EffectFade, Autoplay, Navigation, Pagination]}
    slidesPerView={1}
    navigation
    pagination={{type: "progressbar"}}
    effect="fade"
    autoplay={{delay: 3000}}
    >
    {listings.map(({data, id})=>(
        <SwiperSlide key={id} onClick={()=>navigate(`/category/${data.type}/${id}`)}>
            <div style={{background: `url(${data.imgUrls[0]}) center, no-repeat`, 
            backgroundSize: "cover"}}
            className="relative w-full h-[300px] overflow-hidden">

            </div>
            <p className="text-[#f1faee] absolute left-1 top-3 font-medium max-w-[90%] bg-[#457b9d] shadow-lg opacity-90 p-2 rounded-br-3xl">{data.name}</p>
            <p className="text-[#f1faee] absolute left-1 bottom-3 font-semibold max-w-[90%] bg-[#e63946] shadow-lg opacity-90 p-2 rounded-tr-3xl">{data.calories} Calories</p>
        </SwiperSlide>
    ))}
    </Swiper>
  </>
  )
    }
