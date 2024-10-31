import { useNavigate } from "react-router-dom";
import { logout } from "../firebaseConfig";
import { useAuth } from "../authContext";

export default function Header() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleClick = (e) => {
    e.preventDefault();
    const { name } = e.target;
    if (name === "/logout") {
      logout();
    } else {
      navigate(name);
    }
  };
  return (
    <div>
      <div className="flex justify-center items-center mb-4">
        <img src="../../public/logo.jpg" className="size-1/2" alt="Logo" />
      </div>
      <div className="flex justify-between items-center p-4 max-w-screen-lg mx-auto">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-x-4">
          <button
            onClick={handleClick}
            name="/dashboard"
            className="border-none bg-transparent text-slate-300"
          >
            Dashboard
          </button>
          <button
            onClick={handleClick}
            name="/characters"
            className="border-none bg-transparent text-slate-300"
          >
            Characters
          </button>
          <button
            onClick={handleClick}
            name="/campaigns"
            className="border-none bg-transparent text-slate-300"
          >
            Campaigns
          </button>
          <button
            onClick={handleClick}
            name="/maps"
            className="border-none bg-transparent text-slate-300"
          >
            Maps
          </button>
        </div>
        {!currentUser ? (
          <div className="flex space-x-4">
            <button
              onClick={handleClick}
              name="/login"
              className="border-none bg-transparent text-slate-300"
            >
              Sign In
            </button>
            <button
              onClick={handleClick}
              name="/signup"
              className="border-none bg-transparent text-slate-300"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={handleClick}
              name="/logout"
              className="border-none bg-transparent text-slate-300"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
