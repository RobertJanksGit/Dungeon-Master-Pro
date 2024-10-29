import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { useState, useEffect } from "react";

const ProtectedRoute = () => {
  const [loggedIn, setLoggedIn] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });

    return unsubscribe;
  }, []);

  // Handle loading state while checking auth status
  if (loggedIn === null) {
    return <div>Loading...</div>;
  }

  // If not logged in, navigate to login
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the requested component
  return <Outlet />;
};

export default ProtectedRoute;
