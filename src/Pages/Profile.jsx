import { useEffect, useState } from "react"
import {getAuth, updateProfile} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import { CiForkAndKnife } from "react-icons/ci";
import ListingItem from "../components/ListingItem";

export default function Profile() {
  const auth = getAuth()
  const navigate = useNavigate()
  const [changeDetail, setChangeDetail] = useState(false)
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const {name, email} = formData
  function onLogout(){
    auth.signOut()
    navigate("/")
  }
  function onChange(e){
    setFormData((prevState)=>({
      ...prevState, 
      [e.target.id]: e.target.value,
    }));
  }
  async function onSubmit(){
    try {
      if (auth.currentUser.displayName !== name){
        //update displayname in firebase auth
        await updateProfile(auth.currentUser, {displayName: name,

        });
        //update name in firestore

        const docRef = doc(db, "users", auth.currentUser.uid)
        await updateDoc(docRef, {
          name, 
        });
      }
      toast.success('Profile details updated');
    } catch (error) {
      toast.error("Could not update the profile")
      
    }

  }
    useEffect(()=>{
      async function fetchUserListings(){
        const listingRef = collection(db, "listings");
        const q = query(listingRef, where("userRef", "==", auth.currentUser.uid), orderBy("timestamp", "desc"))
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
      fetchUserListings();
    }, [auth.currentUser.uid])

    async function onDelete(listingID){
      if(window.confirm("Are you sure you want to delete?")) {
        await deleteDoc(doc(db, "listings", listingID))
        const updatedListings = listings.filter(
          (listing)=> listing.id !== listingID
        )
        setListings(updatedListings)
        toast.success("Successfully deleted the listing")
      }
    }
    function onEdit(listingID){
      navigate(`/edit-recipe/${listingID}`)
    }

    return(
        <>
        <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
          <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
          <div className="w-full md:w-[50%] mt-6 px-3">
            <form>
              {/* Name Input */}

              <input type ="text" id="name" value={name} disabled={!changeDetail} onChange={onChange} className={`mb-6 w-full px-4 py-2 text-xl 
              text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out ${changeDetail && "bg-red-200 focus:bg-red-200"}`}
              />

              {/* Email Input*/}
              <input type ="email" id="email" value={email} disabled className="mb-6 w-full px-4 py-2 text-xl 
              text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"/>


              <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
                <p className="flex items-center mb-6">
                  Do you want to change your name?
                  <span 
                  onClick={() =>{
                    changeDetail && onSubmit();
                    setChangeDetail((prevState)=> !prevState)}}
                  className="text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer">{changeDetail ? "Apply change" : "Edit"}</span>
                </p>
                <p onClick={onLogout} className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out cursor-pointer">Sign out</p>
              
              </div>

            </form>
            {/*change color to match the health color */}
            <button type="submit" className="w-full bg-blue-600 text-white uppercase px-7 py-3 text-sm font-medium 
            rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg
            active:bg-blue-800">
              {/*Change create listing to create meal */} 
              <Link to="/create-meal" className="flex justify-center items-center">
              {/* this section is to have the ability to add a recipe */} 
            <CiForkAndKnife className="mr-2 text-3xl "/>
              Create Meal 
              </Link>
            </button>
          </div> 
        </section>
        <div className="max-w-6xl px-3 mt-6 mx-auto">
          {!loading && listings.length > 0 && (
            <>
            <h2 className="text-2xl text-center font-semibold mb-6 mt-6">My Recipes</h2>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl-grid-cols-5 mt-6 mb-6">
              {listings.map((listing)=>(
                <ListingItem 
                key={listing.id} 
                id={listing.id} 
                listing={listing.data}
                onDelete={()=>onDelete(listing.id)}
                onEdit={()=>onEdit(listing.id)}
                />

              ))}
            </ul>
            </>


          )}
        </div>
      </>
    )
}