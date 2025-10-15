// src/AuthenticatedApp.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import ClientesPage from "./pages/ClientesPage";
import HorarioMedico from "./pages/HorarioTerapia";
import Metricas from "./pages/Metricas";
import { AnimatePresence } from "framer-motion";
import AnimatedPage from "./components/AnimatedPage";
import Panel from "./components/Panel";
import useAvisos from "./hooks/useAvisos";
import { useState} from "react";
import { supabase } from "./supabaseClient";


const AuthenticatedApp = ({ onLogout }) => {
  const location = useLocation();
  const { avisos, cargando, error, recargar } = useAvisos();
  const [mostrarAvisos, setMostrarAvisos] = useState(false);

  const handleCrearAviso = async (nuevoAviso) => {
    const { error } = await supabase.from("avisos").insert(nuevoAviso);
    if (!error) {
      recargar();
    } else {
      console.error("Error al guardar aviso:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header onLogout={onLogout} />
      <div className="flex justify-center p-6">
        <div className="w-full max-w-6xl min-h-[calc(100vh-80px)]">
          <div
            key={location.pathname}
            className="animate-slide-left animate-duration-500 animate-ease-out">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route
                  path="/clientes"
                  element={
                    <AnimatedPage>
                      <ClientesPage />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/horario"
                  element={
                    <AnimatedPage>
                      <HorarioMedico />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/metricas"
                  element={
                    <AnimatedPage>
                      <Metricas />
                    </AnimatedPage>
                  }
                />
                <Route path="*" element={<Navigate to="/horario" />} />
              </Routes>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Panel/>
    </div>
  );
};

export default AuthenticatedApp;
