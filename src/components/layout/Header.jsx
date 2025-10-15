import React from "react";
import { Button } from "@/components/ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import Icon from "../shared/Icons";
import { useState } from "react";
import { useLocation } from "react-router-dom";
const Header = ({ onLogout }) => {
  const navigate = useNavigate();

  const activeColorClasses = "bg-white text-blue-600 hover:bg-white ronded-lg shadow-sm";
  const inactiveColorClasses = "text-gray-600 bg-transparent hover:bg-transparent border-none outline-none shadow-none";
  const [menuOpen, setMenuOpen] = useState(false);

  const TituloDinamico = () => {
    const location = useLocation();

    const getTitulo = () => {
      if (location.pathname === "/clientes") {
        return (
          <div className="flex items-center gap-2">
            <Icon name="people" className="text-green-500"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 text-lg md:text-2xl font-bold">
              Gestión de Clientes
            </span>
          </div>
        );
      }
      if (location.pathname === "/horario") {
        return (
          <div className="flex items-center gap-2">
            <Icon name="calendarT" className="text-green-500"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 text-lg md:text-2xl font-bold">
              Horario Semanal
            </span>
          </div>
        );
      }
      if (location.pathname === "/metricas") {
        return (
          <div className="flex items-center gap-2">
            <Icon name="statsT" className="text-green-500"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 text-lg md:text-2xl font-bold">
              Estadísticas
            </span>
          </div>
        );
      }
      return (
        <h1 className="text-2xl font-bold text-gray-800">
          Bienvenido
        </h1>
      );
    };

    return getTitulo();
  };


  return (
    <>
      <header className="relative bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <TituloDinamico />
        <nav className="flex items-center gap-4">
          <button
            className="md:hidden absolute top-4 right-6 z-50 text-gray-700 cursor-pointer"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" size={32} />
          </button>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-xl p-2">
              <NavLink to="/horario">
                {({ isActive }) => (
                  <Button className={`cursor-pointer px-6 py-2.5 ${isActive ? activeColorClasses : inactiveColorClasses}`}>
                    <Icon name="calendar" />Horario
                  </Button>
                )}
              </NavLink>

              <NavLink to="/metricas">
                {({ isActive }) => (
                  <Button className={`cursor-pointer px-6 py-2.5 ${isActive ? activeColorClasses : inactiveColorClasses}`}>
                    <Icon name="stats" />Estadísticas
                  </Button>
                )}
              </NavLink>

              <NavLink to="/clientes">
                {({ isActive }) => (
                  <Button className={`cursor-pointer px-6 py-2.5 ${isActive ? activeColorClasses : inactiveColorClasses}`}>
                    <Icon name="people" />Clientes
                  </Button>
                )}
              </NavLink>
            </div>

            <Button
              variant="ghost"
              className="cursor-pointer text-white bg-red-500 hover:bg-red-600 hover:text-white"
              onClick={() => {
                onLogout?.();
                navigate("/login");
              }}
            >
              Salir
            </Button>
          </div>
        </nav>
      </header>
      {menuOpen && (
        <div className=" top-0 right-0 h-screen w-64 bg-gray-100 pt-12 shadow-lg z-50 p-6 flex flex-col gap-4 fixed">
          <button
            className="cursor-pointer absolute top-4 right-6 text-gray-700"
            onClick={() => setMenuOpen(false)}
          >
            <Icon name="close" size={32} />
          </button>

          <NavLink to="/horario" onClick={() => setMenuOpen(false)}>
            {({ isActive }) => (
              <Button className={`mt-5 cursor-pointer w-50 px-6 py-2.5 ${isActive ? activeColorClasses : inactiveColorClasses}`}>
                <Icon name="calendar" />Horario
              </Button>
            )}
          </NavLink>
          <NavLink to="/metricas" onClick={() => setMenuOpen(false)}>
            {({ isActive }) => (
              <Button className={`cursor-pointer w-50 px-6 py-2.5 ${isActive ? activeColorClasses : inactiveColorClasses}`}>
                <Icon name="stats" />Estadísticas
              </Button>
            )}
          </NavLink>
          <NavLink to="/clientes" onClick={() => setMenuOpen(false)}>
            {({ isActive }) => (
              <Button className={`cursor-pointer w-50 px-6 py-2.5 ${isActive ? activeColorClasses : inactiveColorClasses}`}>
                <Icon name="people" />Clientes
              </Button>
            )}
          </NavLink>

          <Button
            variant="ghost"
            className="cursor-pointer text-white w-50 bg-red-500 hover:bg-red-600 hover:text-white"
            onClick={() => {
              setMenuOpen(false);
              onLogout?.();
              navigate("/login");
            }}
          >
            Salir
          </Button>
        </div>
      )}
    </>);

};

export default Header;
