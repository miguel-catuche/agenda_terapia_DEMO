import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

export const useCitas = (startDate, endDate) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCitas = async () => {
    setLoading(true);

    const { data: citasData, error: citasError } = await supabase
      .from("citas")
      .select("*")
      .gte("fecha", startDate)
      .lte("fecha", endDate)
      .order("fecha", { ascending: true });

    const { data: clientesData, error: clientesError } = await supabase
      .from("clientes")
      .select("id, nombre");

    if (citasError || clientesError) {
      console.error(
        "Error al cargar citas o clientes:",
        citasError?.message || clientesError?.message
      );
      setLoading(false);
      return;
    }

    // unir manualmente
    const citasConCliente = citasData.map((cita) => {
      const cliente = clientesData.find((c) => c.id === cita.cliente_id);
      return {
        ...cita,
        cliente: cliente || null,
      };
    });

    setCitas(citasConCliente);
    setLoading(false);
  };

  useEffect(() => {
    if (startDate === undefined && endDate === undefined) {
      // permite carga sin fechas
      fetchCitas();
    } else if (startDate && endDate) {
      fetchCitas();
    }
  }, [startDate, endDate]);

  const addCita = async (nuevaCita) => {
    const { data, error } = await supabase
      .from("citas")
      .insert([nuevaCita])
      .select();

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
      .eq("id", id)
      .select();

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
