// src/hooks/useClientes.js
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import toast from "react-hot-toast";

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const colombiaOffsetMs = 5 * 60 * 60 * 1000; // UTC-5
  const colombiaDate = new Date(now.getTime() - colombiaOffsetMs);
  const colombiaISOString = colombiaDate.toISOString();

  const fetchClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar clientes:", error.message);
    } else {
      setClientes(data || []);
    }
    setLoading(false);
  };

  const addCliente = async (nuevo) => {
    if (!nuevo?.id) {
      toast.error("El cliente debe tener un ID válido");
      return false;
    }

    // Validar duplicado sin usar .single()
    const { data: existente, error: errorBusqueda } = await supabase
      .from("clientes")
      .select("id")
      .eq("id", nuevo.id)
      .limit(1);

    if (errorBusqueda) {
      console.error("Error al buscar cliente:", errorBusqueda.message);
      toast.error("Error al verificar duplicado");
      return false;
    }

    if (existente && existente.length > 0) {
      toast.error("Ya existe un cliente con ese número de documento");
      return false;
    }

    // Insertar nuevo cliente
    const { data, error } = await supabase
      .from("clientes")
      .insert([
        {
          ...nuevo,
          created_at: colombiaISOString,
          updated_at: colombiaISOString,
        },
      ])
      .select();

    if (error || !data || !data[0]) {
      console.error(
        "Error al agregar cliente:",
        error?.message || "respuesta vacía"
      );
      toast.error("Ocurrió un error al agregar el cliente");
      return false;
    }

    setClientes((prev) => [data[0], ...prev]);
    toast.success(`Cliente "${data[0].nombre}" guardado exitosamente`);
    return true;
  };

  const updateCliente = async (id, actualizado) => {
    const { error } = await supabase
      .from("clientes")
      .update(actualizado)
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar cliente:", error.message);
      return false;
    }

    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...actualizado } : c))
    );
    return true;
  };

  const deleteCliente = async (id) => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) {
      console.error("Error al eliminar cliente:", error.message);
      return false;
    }
    setClientes((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    loading,
    refetch: fetchClientes,
    addCliente,
    updateCliente,
    deleteCliente,
  };
};
