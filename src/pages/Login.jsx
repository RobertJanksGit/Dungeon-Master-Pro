// src/components/Login.js
import { useState } from "react";
import { login } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo2.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFailedLogin, setIsFailedLogin] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
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
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/reset-password")}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Forgot Password?
            </button>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Sign In
          </button>
          <div>or</div>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Continue with Google
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
