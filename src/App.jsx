import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import { supabase } from "./supabaseClient";
import AuthenticatedApp from "./AuthenticatedApp";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    getSession();
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);


  const handleLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Credenciales inválidas");
    } else {
      toast.success("Inicio de sesión exitoso");
      setUser(data.user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };


  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <Router basename="/">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: "1.2rem",
            padding: "16px 20px",
            borderRadius: "10px",
          },
          success: {
            style: { background: "#d1fae5", color: "#065f46" }, // verde éxito
          },
          error: {
            style: { background: "#fee2e2", color: "#991b1b" }, // rojo error
          },
        }}
        containerStyle={{ zIndex: 9999 }}
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
