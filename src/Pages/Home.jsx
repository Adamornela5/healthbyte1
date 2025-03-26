
import { useEffect, useState } from "react";
import Slider from "../components/Slider";
import { collection, doc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router";
import ListingItem from "../components/ListingItem";
export default function Home() {
  // Offers
  const [offerListings, setOfferListings] = useState(null)
  useEffect(()=>{
    async function fetchListings(){
      try {
        // get reference
        const listingsRef = collection(db, "listings")
        // create query
        const q = query(listingsRef, orderBy("timestamp", "desc"), limit(4))
        //execute query
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setOfferListings(listings)
      } catch (error) {
        console.log(error)
      }
    }
    fetchListings()
  }, [])
  // Places for rent
  const [rentListings, setRentListings] = useState(null)
  useEffect(()=>{
    async function fetchListings(){
      try {
        // get reference
        const listingsRef = collection(db, "listings")
        // create query
        const q = query(listingsRef, where("type", "==", "healthy"), orderBy("timestamp", "desc"), limit(4))
        //execute query
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setRentListings(listings)
      } catch (error) {
        console.log(error)
      }
    }
    fetchListings()
  }, [])
  // Places for sale
  const [saleListings, setSaleListings] = useState(null)
  useEffect(()=>{
    async function fetchListings(){
      try {
        // get reference
        const listingsRef = collection(db, "listings")
        // create query
        const q = query(listingsRef, where("type", "==", "unhealthy"), orderBy("timestamp", "desc"), limit(4))
        //execute query
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
          })
        })
        setSaleListings(listings)
      } catch (error) {
        console.log(error)
      }
    }
    fetchListings()
  }, [])
  return (
  <div>
    <Slider />
    <div className="max-w-6xl mx-auto pt-4 space-y-6">
      {offerListings && offerListings.length > 0 && ( // BIG BOY OFFERS
        <div className="m-2 mb-6">
          <h2 className="px-3 text-2xl mt-6 font-semibold">Recent Recipes</h2>
          <Link to="/recipes">
            <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">Show more recipes!</p>

          </Link>
          <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {offerListings.map((listing)=>(
              <ListingItem  key={listing.id} listing={listing.data} id={listing.id}/> // dont know what the third listing id is for
            ))}
          </ul>
        </div>
      )}


      
      {rentListings && rentListings.length > 0 && ( //healthy
        <div className="m-2 mb-6">
          <h2 className="px-3 text-2xl mt-6 font-semibold">Healthy Recipes</h2>
          <Link to="/category/healthy">
            <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">Show more healthy recipes!</p>

          </Link>
          <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rentListings.map((listing)=>(
              <ListingItem  key={listing.id} listing={listing.data} id={listing.id}/> // dont know what the third listing id is for
            ))}
          </ul>
        </div>
      )}




      {saleListings && saleListings.length > 0 && ( //unhealthy
        <div className="m-2 mb-6">
          <h2 className="px-3 text-2xl mt-6 font-semibold">Unhealthy Recipes</h2>
          <Link to="/category/unhealthy">
            <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">Show more unhealthy recipes!</p>

          </Link>
          <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saleListings.map((listing)=>(
              <ListingItem  key={listing.id} listing={listing.data} id={listing.id}/> // dont know what the third listing id is for
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>  
  )
}