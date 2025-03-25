import { useEffect, useState } from "react"
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage"
import { getAuth } from "firebase/auth";
import {v4 as uuidv4} from "uuid";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";

export default function
CreateMeal() {
    const navigate = useNavigate()
    const auth = getAuth()
    const [loading, setLoading] = useState(false);
    const [listing, setListing] = useState(null);
    const [formData, setFormData] = useState({
        type: "rent",
        name:"",
        description:"",
        calories:"",
        images: {},
    });
    const { type, name, description, calories, images } = formData;

    const params = useParams()

    useEffect(()=>{
        if(listing && listing.userRef !== auth.currentUser.uid)
        {
            toast.error("You can't edit this listing")
        }
    },[auth.currentUser.uid, listing, navigate])

    useEffect(()=>{
        setLoading(true)
        async function fetchListing(){
            const docRef = doc(db, "listings", params.listingId)
            const docSnap = await getDoc(docRef)
            if(docSnap.exists()){
                setListing(docSnap.data())
                setFormData({...docSnap.data()})
                setLoading(false)
            }else{
                navigate("/")
                toast.error("Listing does not exist")
            }
        }
        fetchListing()
    }, [navigate, params.listingId])


    function onChange(e) {
        let boolean = null;
        if (e.target.value === "true"){
            boolean = true
        }
        if (e.target.value === "false"){
            boolean = false
        }
        // Files
        if(e.target.files){
            setFormData((prevState)=>({
                ...prevState,
                images: e.target.files
            }))
        }
        // Text/Boolean/Number
        if(!e.target.files){
            setFormData((prevState)=>({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value, 
            }))
        }
    }
    async function onSubmit(e){
        e.preventDefault();
        setLoading(true);
        if (images.length > 6) {
            setLoading(false);
            toast.error("maximum of 6 images are allowed")
            return;
        }

        async function storeImage(image){
            return new Promise((resolve, reject)=>{
                const storage = getStorage()
                const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`
                const storageRef = ref(storage, filename)
                const uploadTask = uploadBytesResumable(storageRef, image)
                uploadTask.on('state_changed', 
                    (snapshot) => {
                      // Observe state change events such as progress, pause, and resume
                      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      console.log('Upload is ' + progress + '% done');
                      switch (snapshot.state) {
                        case 'paused':
                          console.log('Upload is paused');
                          break;
                        case 'running':
                          console.log('Upload is running');
                          break;
                      }
                    }, 
                    (error) => {
                      // Handle unsuccessful uploads
                      reject(error)
                    }, 
                    () => {
                      // Handle successful uploads on complete
                      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                      });
                    }
                  );
            })
        }

        const imgUrls = await Promise.all(
            [...images]
            .map((image) => storeImage(image))
        )
            .catch((error) => {
                setLoading(false)
                toast.error("Images not uploaded")
                return
            }
        )

        const formDataCopy = {
            ...formData,
            imgUrls,
            timestamp: serverTimestamp(),
            userRef: auth.currentUser.uid,
        }
        delete formDataCopy.images;
        // ADD STUFF HERE IDK delete formDataCopy
        const docRef = doc(db, "listings", params.listingId) 
            
            await updateDoc(docRef, formDataCopy)
        
        setLoading(false)
        toast.success("Listing Edited")
        navigate(`/category/${formDataCopy.type}/${docRef.id}`)
    }

    

    if(loading){
        return <Spinner></Spinner>
    }
    return(
        <main className="max-w-md px-2 mx-auto">
            <h1 className="text-3xl text-center mt-6 font-bold">Edit a recipe</h1>
            <form onSubmit={onSubmit}> 

                {/*We can make this page become where we deicde how i*/}

                <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
                <div className="flex">
                    <button type="button" 
                    id="type" 
                    value="sale"

                    /*Change color to green or black*/

                    onClick={onChange} 
                    className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
                        type === "rent" ? "bg-white text-black": "bg-slate-600 text-white"
                    }`}>
                        sell

                    </button>
                    <button type="button" 
                    id="type" 
                    value="rent"
                    onClick={onChange}                    /*Change color to green or black*/
                    className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
                        type === "sale" ? "bg-white text-black": "bg-slate-600 text-white"
                    }`}>
                        rent

                    </button>
                </div>
                <p className="text-lg mt-6 font-semibold">Name</p>
                <input type="text" id="name" value={name} 
                onChange={onChange} 
                placeholder="Name" 
                maxLength="32" 
                min="2"
                required 
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white
                border border-gray-300 rounded transition duration-150 ease-in-out 
                focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
                />
                <p className="text-lg mt-6 font-semibold">Description</p>
                <textarea type="text" 
                id="description" 
                value={description} 
                onChange={onChange} 
                placeholder="Description" 
                maxLength="32" 
                min="2"
                required 
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white
                border border-gray-300 rounded transition duration-150 ease-in-out 
                focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
                />
                <div className="">
                    <div className="">
                        <p className="text-lg font-semibold ">Calories</p>
                        <div className=""> 
                            <input 
                            type="number" 
                            id="calories" 
                            value={calories} onChange={onChange} min="5" max="99999" required className="w-full px-4 py-2
                            text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150
                            ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"/>
                        </div>
                    </div>
                </div>
                <div className="mb-6 ">
                    <p className="text-lg font-semi-bold ">Images</p>
                    <p className="text-gray-600">The first image will be the cover</p>
                    <input type="file" id="images" onChange={onChange}
                    accept=".jpg,.png,.jpeg"
                    multiple
                    required
                    className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300
                    rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600"
                    />
                </div>
                <button type="submit" className="mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"> Edit Meal</button>
            </form>
        </main>
    );
}