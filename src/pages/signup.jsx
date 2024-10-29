// src/components/Login.js
import React, { useState } from "react";
import { signup } from "../firebaseConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    signup(email, setEmail, password, setPassword);
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
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
};

export default Login;
