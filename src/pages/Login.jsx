// src/components/Login.js
import React, { useState } from "react";
import { login } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    login(email, setEmail, password, setPassword);
    navigate("/dashboard");
  };

  return (
    <div>
      <input
        className="text-black"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        className="text-black"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
};

export default Login;
