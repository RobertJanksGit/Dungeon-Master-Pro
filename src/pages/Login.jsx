// src/components/Login.js
import { useState } from "react";
import { login, signInWithGoogle } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo2.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFailedLogin, setIsFailedLogin] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsFailedLogin(true);
      return;
    }

    // Check if password is not empty
    if (!password.trim()) {
      setIsFailedLogin(true);
      return;
    }

    const success = await login(
      email,
      setEmail,
      password,
      setPassword,
      setIsFailedLogin
    );
    if (success) {
      navigate("/dashboard");
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  const handelSwitch = () => {
    navigate("/signup");
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      const success = await signInWithGoogle();
      if (success) {
        navigate("/dashboard");
      } else {
        setIsFailedLogin(true);
      }
    } catch (error) {
      console.error("Google sign in failed:", error);
      setIsFailedLogin(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-[90%] max-w-md">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ✕
        </button>
        <img src={logo} className="mx-auto mb-6 w-1/2" alt="Logo" />
        <h2 className="text-white text-2xl mb-4">
          Sign into your Dungeon Master Pro Account
        </h2>
        <p className="text-gray-300 mb-8">
          Need to create an account? <a onClick={handelSwitch}>Sign up</a>
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="text-black w-full p-2 rounded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="text-black w-full p-2 rounded"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          {isFailedLogin && (
            <p className="text-red-500 text-sm">Invalid email or password</p>
          )}
          <div className="flex justify-center">
            <a
              href="/reset-password"
              onClick={(e) => {
                e.preventDefault();
                navigate("/reset-password");
              }}
              className="text-sm text-gray-400 hover:text-gray-300 cursor-pointer"
            >
              Forgot Password?
            </a>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Sign In
          </button>
          <div>or</div>
          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            onClick={handleGoogleSignIn}
          >
            Sign in with Google
          </button>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Continue with Apple
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
