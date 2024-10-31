import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./authContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./protectedRoute";

function App() {
  const [navigateCounter, setNavigateCounter] = useState(-2);
  return (
    <div className="w-screen">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <Login
                  navigateCounter={navigateCounter}
                  setNavigateCounter={setNavigateCounter}
                />
              }
            />
            <Route
              path="/signup"
              element={
                <Signup
                  navigateCounter={navigateCounter}
                  setNavigateCounter={setNavigateCounter}
                />
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
