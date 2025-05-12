import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import Spinner from "../components/Spinner";

export default function EditMeal() {
  const navigate = useNavigate();
  const auth = getAuth();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState({
    type: "healthy",
    name: "",
    description: "",
    calories: "",
    healthRating: 5,
    tags: "",
    images: {},
  });

  const { type, name, description, calories, healthRating, tags, images } = formData;

  useEffect(() => {
    async function fetchListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userRef !== auth.currentUser.uid) {
          toast.error("You can't edit this listing");
          navigate("/");
          return;
        }
        setListing(data);
        setFormData({ ...data, images: {} }); // don't load old images into file input
        setLoading(false);
      } else {
        toast.error("Listing does not exist");
        navigate("/");
      }
    }

    fetchListing();
  }, [auth.currentUser.uid, navigate, params.listingId]);

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

    let imgUrls = listing.imgUrls || [];

    if (images.length > 0) {
      if (images.length > 6) {
        setLoading(false);
        toast.error("Maximum of 6 images allowed");
        return;
      }

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

      imgUrls = await Promise.all([...images].map(storeImage)).catch((err) => {
        setLoading(false);
        toast.error("Image upload failed");
        return;
      });
    }

    const formDataCopy = {
      ...formData,
      imgUrls,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };
    delete formDataCopy.images;

    const docRef = doc(db, "listings", params.listingId);
    await updateDoc(docRef, formDataCopy);

    setLoading(false);
    toast.success("Listing updated");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  }

  if (loading) return <Spinner />;

  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold">Edit Recipe</h1>
      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">Healthy or Unhealthy?</p>
        <div className="flex">
          {["healthy", "unhealthy"].map((value) => (
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
        <input
          id="name"
          type="text"
          value={name}
          onChange={onChange}
          placeholder="Name"
          required
          className="w-full my-2 px-4 py-2 border rounded"
        />

        <p className="text-lg font-semibold mt-4">Description</p>
        <textarea
          id="description"
          value={description}
          onChange={onChange}
          placeholder="Description"
          required
          className="w-full my-2 px-4 py-2 border rounded"
        ></textarea>

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
            {healthRating <= 3
              ? "🧨 Treat Yo Self"
              : healthRating <= 6
              ? "😌 Balanced"
              : "💪 Super Clean"}
          </p>
        </div>

        <p className="text-lg font-semibold mt-4">Calories</p>
        <input
          id="calories"
          type="number"
          value={calories}
          onChange={onChange}
          min="5"
          max="99999"
          required
          className="w-full my-2 px-4 py-2 border rounded text-center"
        />

        <p className="text-lg font-semibold mt-4">Tags</p>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={onChange}
          placeholder="e.g. #vegan #protein"
          className="w-full my-2 px-4 py-2 border rounded"
        />

        <p className="text-lg font-semibold mt-4">Upload New Images (optional)</p>
        <input
          id="images"
          type="file"
          onChange={onChange}
          multiple
          accept=".jpg,.png,.jpeg"
          className="w-full my-2 px-3 py-1 border rounded"
        />

        <button
          type="submit"
          className="w-full mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}
