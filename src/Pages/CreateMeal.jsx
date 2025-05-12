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
      setFormData((prev) => ({ ...prev, images: e.target.files }));
    } else {
      setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
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

  // Debug: log incoming files
  console.log("Selected files:", images);

  for (let file of images) {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    console.log("File:", file.name, "| Type:", file.type);

    const isHeic =
      fileType === "image/heic" ||
      fileType === "image/heif" ||
      fileName.endsWith(".heic") ||
      fileName.endsWith(".heif");

    if (isHeic) {
      try {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9,
        });

        const jpegFile = new File([convertedBlob], `${file.name}.jpeg`, {
          type: "image/jpeg",
        });

        convertedImages.push(jpegFile);
      } catch (error) {
        console.error("HEIC conversion failed:", error);
        toast.error("Failed to convert HEIC image.");
        setLoading(false);
        return;
      }
    } else if (
      fileType === "image/jpeg" ||
      fileType === "image/png" ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png")
    ) {
      convertedImages.push(file);
    } else {
      toast.error(`Unsupported file type: ${file.name}`);
      setLoading(false);
      return;
    }
  }

  // Upload to Firebase
  const storeImage = (image) =>
    new Promise((resolve, reject) => {
      const storage = getStorage();
      const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve);
        }
      );
    });

  const imgUrls = await Promise.all(convertedImages.map(storeImage)).catch((error) => {
    console.error("Upload failed:", error);
    toast.error("Image upload failed.");
    setLoading(false);
    return;
  });

  const formDataCopy = {
    ...formData,
    imgUrls,
    timestamp: serverTimestamp(),
    userRef: auth.currentUser.uid,
  };

  delete formDataCopy.images;

  await addDoc(collection(db, "listings"), formDataCopy);

  setLoading(false);
  toast.success("Listing created!");
  navigate(`/category/${formDataCopy.type}`);
}


  if (loading) return <Spinner />;

  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold">Create a Recipe</h1>
      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">Healthy or Unhealthy?</p>
        <div className="flex">
          {['healthy', 'unhealthy'].map((value) => (
            <button
              key={value}
              type="button"
              id="type"
              value={value}
              onClick={onChange}
              className={`mx-1 px-5 py-2 font-medium text-sm uppercase rounded transition-all duration-150 ease-in-out w-full ${
                type === value ? "bg-green-500 text-white" : "bg-white border border-gray-400"
              }`}
            >
              {value === "healthy" ? "🥦 Healthy" : "🍕 Unhealthy"}
            </button>
          ))}
        </div>

        <p className="text-lg font-semibold mt-4">Name</p>
        <input id="name" type="text" value={name} onChange={onChange} placeholder="Name"
          required className="w-full my-2 px-4 py-2 border rounded" />

        <p className="text-lg font-semibold mt-4">Description</p>
        <textarea id="description" value={description} onChange={onChange} placeholder="Description"
          required className="w-full my-2 px-4 py-2 border rounded"></textarea>

        <p className="text-lg font-semibold mt-4">Health Rating</p>
        <div className="my-2">
          <label className="block text-sm font-medium">Rate how healthy this recipe is (1–10)</label>
          <input
            type="range"
            id="healthRating"
            min="1"
            max="10"
            value={healthRating}
            onChange={onChange}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            {healthRating <= 3 ? "🧨 Treat Yo Self" : healthRating <= 6 ? "😌 Balanced" : "💪 Super Clean"}
          </p>
        </div>

        <p className="text-lg font-semibold mt-4">Calories</p>
        <input id="calories" type="number" value={calories} onChange={onChange} min="5" max="99999"
          required className="w-full my-2 px-4 py-2 border rounded text-center" />

        <p className="text-lg font-semibold mt-4">Tags</p>
        <input id="tags" type="text" value={tags} onChange={onChange} placeholder="e.g. #vegan #protein"
          className="w-full my-2 px-4 py-2 border rounded" />

        <p className="text-lg font-semibold mt-4">Images</p>
        <input
          id="images"
          type="file"
          onChange={onChange}
          multiple
          required
          accept=".jpg,.jpeg,.png,.heic,.HEIC"
          className="w-full my-2 px-3 py-1 border rounded"
        />

        <button type="submit"
          className="w-full mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create Meal
        </button>
      </form>
    </main>
  );
}

