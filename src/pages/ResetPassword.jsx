import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import logo from "../assets/logo.jpg";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
      setError("");
    } catch (error) {
      setError("Failed to reset password. Please check your email address.");
      setMessage("");
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  const handleBackToLogin = () => {
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
        <h2 className="text-white text-2xl mb-4">Reset Your Password</h2>
        <p className="text-gray-300 mb-8">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            className="text-black w-full p-2 rounded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          {message && <p className="text-green-400 text-sm mt-2">{message}</p>}
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Reset Password
          </button>
          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full bg-transparent text-gray-300 py-2 rounded hover:text-white transition"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
