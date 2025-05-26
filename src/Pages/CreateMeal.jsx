import { useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import heic2any from "heic2any";
import axios from "axios";

export default function CreateMeal() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "healthy",
    name: "",
    description: "",
    calories: "",
    images: {},
    likes: 0,
    likedBy: [],
    healthRating: 5,
    tags: ""
  });

  const { type, name, description, calories, images, healthRating, tags } = formData;

  function onChange(e) {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, images: e.target.files }));
    } else {
      setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    }
  }

  // AI + SafeSearch helper
  async function checkImageForFoodAndSafety(imageUrl) {
    try {
      const { data } = await axios.post(
        "https://us-central1-healthbyte-c33bc.cloudfunctions.net/analyzeImageLabels",
        { imageUrl }
      );
      const { labels = [], safeSearch } = data;
      const hasFoodLabel = labels.some(l => [
        "Food","Dish","Cuisine","Drink","Meal"
      ].includes(l.description));
      const safe = !["LIKELY","VERY_LIKELY"].includes(safeSearch.adult)
                && !["LIKELY","VERY_LIKELY"].includes(safeSearch.violence)
                && !["LIKELY","VERY_LIKELY"].includes(safeSearch.racy);
      return hasFoodLabel && safe;
    } catch (error) {
      console.error("AI check error:", error);
      return false;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (!images || images.length === 0) {
      toast.error("Please select at least one image.");
      setLoading(false);
      return;
    }
    if (images.length > 6) {
      toast.error("Maximum of 6 images allowed.");
      setLoading(false);
      return;
    }

    const convertedImages = [];
    for (const file of images) {
      const fileName = file.name.toLowerCase();
      const fileType = file.type;
      const isHeic = fileType.includes("heic") || fileName.endsWith(".heic");
      if (isHeic) {
        try {
          const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
          convertedImages.push(new File([blob], `${file.name}.jpeg`, { type: "image/jpeg" }));
        } catch (error) {
          toast.error("Failed to convert HEIC image. Please try another.");
          setLoading(false);
          return;
        }
      } else if (/image\/(jpeg|png)/.test(fileType)) {
        convertedImages.push(file);
      } else {
        toast.error(`Unsupported file type: ${file.name}`);
        setLoading(false);
        return;
      }
    }

    const storeImage = image => new Promise((resolve, reject) => {
      const storage = getStorage();
      const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, image);
      uploadTask.on('state_changed', null, reject, () => getDownloadURL(uploadTask.snapshot.ref).then(resolve));
    });

    let imgUrls;
    try {
      imgUrls = await Promise.all(convertedImages.map(storeImage));
    } catch (error) {
      toast.error("Image upload failed. Try again.");
      setLoading(false);
      return;
    }

    for (const url of imgUrls) {
      const ok = await checkImageForFoodAndSafety(url);
      if (!ok) {
        toast.error("One or more images failed our food/safety check. Please upload valid photos. -AI by Adam");
        setLoading(false);
        return;
      }
    }

    const formDataCopy = {...formData, imgUrls, timestamp: serverTimestamp(), userRef: auth.currentUser.uid};
    delete formDataCopy.images;
    await addDoc(collection(db, "listings"), formDataCopy);

    toast.success("Listing created!");
    setLoading(false);
    navigate(`/category/${formDataCopy.type}`);
  }

  if (loading) return <Spinner />;

  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold">Create a Recipe</h1>
      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">Healthy or Unhealthy?</p>
        <div className="flex">
          {["healthy","unhealthy"].map((value) => (
            <button key={value} type="button" id="type" value={value} onClick={onChange}
              className={`mx-1 px-5 py-2 text-sm uppercase rounded transition-all duration-150 ease-in-out w-full ${
                type===value ? "bg-green-500 text-white" : "bg-white border border-gray-400"
              }`}>
              {value==="healthy"?"🥦 Healthy":"🍕 Unhealthy"}
            </button>
          ))}
        </div>

        <p className="text-lg font-semibold mt-4">Name</p>
        <input id="name" type="text" value={name} onChange={onChange} placeholder="Name" required className="w-full my-2 px-4 py-2 border rounded" />

        <p className="text-lg font-semibold mt-4">Description</p>
        <textarea id="description" value={description} onChange={onChange} placeholder="Description" required className="w-full my-2 px-4 py-2 border rounded"></textarea>

        <p className="text-lg font-semibold mt-4">Health Rating</p>
        <div className="my-2">
          <label className="block text-sm font-medium">Rate how healthy this recipe is (1–10)</label>
          <input type="range" id="healthRating" min="1" max="10" value={healthRating} onChange={onChange} className="w-full" />
          <p className="text-xs text-gray-500 mt-1">{healthRating<=3?"🧨 Treat Yo Self":healthRating<=6?"😌 Balanced":"💪 Super Clean"}</p>
        </div>

        <p className="text-lg font-semibold mt-4">Calories</p>
        <input id="calories" type="number" value={calories} onChange={onChange} min="5" max="99999" required className="w-full my-2 px-4 py-2 border rounded text-center" />

        <p className="text-lg font-semibold mt-4">Tags</p>
        <input id="tags" type="text" value={tags} onChange={onChange} placeholder="e.g. #vegan #protein" className="w-full my-2 px-4 py-2 border rounded" />

        <p className="text-lg font-semibold mt-4">Images (Post one or more photos)</p>
        <input id="images" type="file" onChange={onChange} multiple required accept="image/*" className="w-full my-2 px-3 py-1 border rounded" />

        

        <button type="submit" className="w-full mt-4 mb-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Meal</button>
      </form>
    </main>
  );
}
