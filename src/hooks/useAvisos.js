import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

const useAvisos = () => {
  const [avisos, setAvisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarAvisos = async () => {
    setCargando(true);
    setError(null);

    await limpiarAvisosExpirados();

    const { data, error } = await supabase
      .from("avisos")
      .select("*")
      .order("fecha_creacion", { ascending: false });

    if (error) {
      console.error("Error al cargar avisos:", error.message);
      setError(error);
      setAvisos([]);
    } else {
      const ordenados = data.sort((a, b) => {
        const prioridadValor = { alta: 0, media: 1, baja: 2 };
        const pa = prioridadValor[a.prioridad] ?? 3;
        const pb = prioridadValor[b.prioridad] ?? 3;

        if (pa !== pb) return pa - pb;
        return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
      });

      setAvisos(ordenados);
    }

    setCargando(false);
  };

  const eliminarAviso = async (id) => {
    const { error } = await supabase.from("avisos").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar aviso:", error.message);
      return false;
    }

    await cargarAvisos();
    return true;
  };

  const limpiarAvisosExpirados = async () => {
    const ahora = new Date().toISOString();

    const { error } = await supabase
      .from("avisos")
      .delete()
      .lt("fecha_expiracion", ahora);

    if (error) {
      console.error("Error al limpiar avisos expirados:", error.message);
    } else {
      console.log("✅ Avisos expirados eliminados automáticamente");
    }
  };

  useEffect(() => {
    cargarAvisos();
  }, []);

  return {
    avisos,
    cargando,
    error,
    recargar: cargarAvisos,
    eliminarAviso,
  };
};

export default useAvisos;
