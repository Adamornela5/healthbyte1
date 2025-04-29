import { useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { doc, updateDoc, query, collection, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreateUserName() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Check if username already exists
      const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const querySnapshot = await getDocs(usernameQuery);

      if (!querySnapshot.empty) {
        toast.error("Username already taken. Please choose another.");
        setLoading(false);
        return;
      }

      // 2. Update current user's document
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        username: username,
      });

      toast.success("Username set successfully!");
      navigate("/"); // 3. Go to home page after
    } catch (error) {
      console.error(error);
      toast.error("Failed to set username. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-3xl font-bold mb-6">Create Your Username</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a unique username"
          className="w-full mb-4 px-4 py-2 border rounded text-lg"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded text-lg transition"
        >
          {loading ? "Saving..." : "Save Username"}
        </button>
      </form>
    </div>
  );
}
