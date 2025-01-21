import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import ProfileMenu from "./ProfileMenu";

export default function Header() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleClick = (e) => {
    e.preventDefault();
    navigate(e.target.name);
  };

  return (
    <div>
      <div className="flex justify-between items-center p-4 max-w-screen-lg mx-auto">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-x-4">
          {currentUser && (
            <button
              onClick={handleClick}
              name="/dashboard"
              className="border-none bg-transparent text-slate-300"
            >
              Dashboard
            </button>
          )}
          {currentUser && (
            <div>
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
          )}
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
              Register
            </button>
          </div>
        ) : (
          <ProfileMenu />
        )}
      </div>
    </div>
  );
}
