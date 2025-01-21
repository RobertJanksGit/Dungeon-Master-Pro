import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { doc, getDoc } from "firebase/firestore";
import { db, logout } from "../firebaseConfig";
import DefaultAvatar from "./DefaultAvatar";

const ProfileMenu = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#0a1121]/50 rounded-lg px-3 py-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden">
          {userData?.profileImage ? (
            <img
              src={userData.profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full">
              <DefaultAvatar />
            </div>
          )}
        </div>
        <span className="text-slate-300">
          {userData?.displayName || "SuperMeeshi"}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-slate-700">
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="text-sm font-medium text-slate-300 truncate">
              {currentUser?.email}
            </p>
          </div>

          <Link
            to="/settings"
            className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>

          <div className="border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-slate-300"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
