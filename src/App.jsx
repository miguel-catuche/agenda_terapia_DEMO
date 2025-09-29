// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import { supabase } from "./supabaseClient";
import AuthenticatedApp from "./AuthenticatedApp";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <Router basename="/">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: "1.2rem",   // 🔥 texto más grande
            padding: "16px 20px", // más espacio interno
            borderRadius: "10px",
          },
          success: {
            style: { background: "#d1fae5", color: "#065f46" }, // verde éxito
          },
          error: {
            style: { background: "#fee2e2", color: "#991b1b" }, // rojo error
          },
        }}
        containerStyle={{ zIndex: 9999 }} // asegura que quede encima de modales
      />
      {user ? (
        <AuthenticatedApp
          onLogout={handleLogout}
        />
      ) : (
        <Routes>
          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;
