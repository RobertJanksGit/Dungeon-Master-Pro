// src/components/Login.js
import React, { useState } from "react";
import { signup } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo2.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    signup(email, setEmail, password, setPassword);
  };

  const handleClose = () => {
    navigate("/");
  };

  const handelSwitch = () => {
    navigate("/login");
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
          Create Your Dungeon Master Pro Account
        </h2>
        <p className="text-gray-300 mb-8">
          Already have an account? <a onClick={handelSwitch}>Sign in</a>
        </p>
        <form onSubmit={handleSignup} className="space-y-4">
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
            By creating an account, you agree to the Terms of Use and have read
            our Privacy Policy.
          </p>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
