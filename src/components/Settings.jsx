import { useState, useEffect } from "react";
import { useAuth } from "../authContext";
import { storage, db } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import Header from "./Header";
import DefaultAvatar from "./DefaultAvatar";

const Settings = () => {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.displayName || "");
          setProfileImage(userData.profileImage || "");
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setLoading(true);
      const storageRef = ref(storage, `profile_images/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", currentUser.uid), {
        profileImage: imageUrl,
      });

      setProfileImage(imageUrl);
      setMessage({
        type: "success",
        content: "Profile image updated successfully!",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage({
        type: "error",
        content: "Failed to upload image. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName,
      });
      setMessage({
        type: "success",
        content: "Settings updated successfully!",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      setMessage({
        type: "error",
        content: "Failed to update settings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-slate-200 mb-6">Settings</h2>

        {message.content && (
          <div
            className={`mb-4 p-4 rounded ${
              message.type === "success"
                ? "bg-green-700 text-green-100"
                : "bg-red-700 text-red-100"
            }`}
          >
            {message.content}
          </div>
        )}

        <div className="bg-slate-800 rounded-lg p-6 space-y-6">
          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Profile Image
            </label>
            <div
              className={`w-40 h-40 rounded-full mx-auto relative group bg-slate-700 ${
                isDragging ? "border-2 border-blue-500" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full p-6">
                  <DefaultAvatar />
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                />
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </label>
            </div>
            <p className="text-sm text-slate-400 text-center mt-2">
              Drag and drop an image or click to upload
            </p>
          </div>

          {/* Display Name */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200"
                placeholder="Enter your display name"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Settings;
