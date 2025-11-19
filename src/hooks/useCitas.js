import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

export const useCitas = (startDate, endDate) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Valores por defecto (Colombia)
  const DEFAULT_START = startDate || "2000-01-01";
  const DEFAULT_END = endDate || "2100-01-01";

  const fetchCitas = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("citas")
      .select(
        `
        id,
        fecha,
        hora,
        estado,
        clientes_servicio_id,
        clientes_servicio (
          servicio,
          cliente_id,
          cliente:clientes (
            nombre,
            motivo
          )
        )
      `
      )
      .gte("fecha", DEFAULT_START)
      .lte("fecha", DEFAULT_END)
      .order("fecha", { ascending: true });

    if (error) {
      console.error("Error al cargar citas:", error.message);
      setLoading(false);
      return;
    }

    setCitas(data || []);
    setLoading(false);
  };

  // Solo recargar cuando cambien explícitamente las fechas
  useEffect(() => {
    fetchCitas();
  }, [startDate, endDate]);

  const addCita = async (nuevaCita) => {
    const { data, error } = await supabase.from("citas").insert([nuevaCita])
      .select(`
        *,
        clientes_servicio (
          servicio,
          cliente_id,
          cliente:clientes (
            nombre,
            motivo
          )
        )
      `);

    if (error || !data || !data[0]) {
      console.error(
        "Error al agregar cita:",
        error?.message || "respuesta vacía"
      );
      return false;
    }

    setCitas((prev) => [...prev, data[0]]);
    return true;
  };

  const updateCita = async (id, updatedData) => {
    const { data, error } = await supabase
      .from("citas")
      .update(updatedData)
      .eq("id", id).select(`
        *,
        clientes_servicio (
          servicio,
          cliente_id,
          cliente:clientes (
            nombre,
            motivo
          )
        )
      `);

    if (error || !data || !data[0]) {
      console.error(
        "Error al actualizar cita:",
        error?.message || "respuesta vacía"
      );
      return false;
    }

    setCitas((prev) => prev.map((cita) => (cita.id === id ? data[0] : cita)));
    return true;
  };

  const deleteCita = async (id) => {
    const { error } = await supabase.from("citas").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar cita:", error.message);
      return false;
    }

    setCitas((prev) => prev.filter((cita) => cita.id !== id));
    return true;
  };

  return {
    citas,
    loading,
    refetch: fetchCitas,
    addCita,
    updateCita,
    deleteCita,
  };
};
