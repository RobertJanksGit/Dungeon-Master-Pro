// src/components/Login.js
import React, { useState } from "react";
import { login } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Login = ({ navigateCounter, setNavigateCounter }) => {
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
    navigate(navigateCounter);
    setNavigateCounter(-1);
  };

  const handelSwitch = () => {
    setNavigateCounter(navigateCounter - 1);
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
        <img
          src="../../public/logo2.jpg"
          className="mx-auto mb-6 w-1/2"
          alt="Logo"
        />
        <h2 className="text-white text-2xl mb-4">
          Sign into your Dungeon Master Pro Account
        </h2>
        <p className="text-gray-300 mb-8">
          Need to create an account? <a onClick={handelSwitch}>Sign up</a>
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          {isFailedLogin && (
            <p className="text-red-600 font-bold">Invalid email or password</p>
          )}
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
          <p className="text-gray-400 text-sm mt-6">
            By logging in, you agree to the Terms of Use and have read our
            Privacy Policy.
          </p>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Log In
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
