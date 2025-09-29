// src/AuthenticatedApp.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import ClientesPage from "./pages/ClientesPage";
import HorarioMedico from "./pages/HorarioMedico";
import Metricas from "./pages/Metricas";
import { AnimatePresence } from "framer-motion";
import AnimatedPage from "./components/AnimatedPage";

const AuthenticatedApp = ({ onLogout }) => {
  const location = useLocation();

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
    </div>
  );
};

export default AuthenticatedApp;
