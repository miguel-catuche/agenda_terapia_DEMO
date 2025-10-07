// src/hooks/useClienteServicio.js
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useServicioLabels } from "@/helpers/useServicioLabels";
import toast from "react-hot-toast";

export const useClienteServicio = (clienteId) => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getLabel } = useServicioLabels();

  const fetchServicios = async () => {
    if (!clienteId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("clientes_servicio")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("fecha_asignacion", { ascending: false });

    if (error) {
      console.error("Error al cargar servicios:", error.message);
      toast.error("Error al cargar servicios");
    } else {
      setServicios(data || []);
    }
    setLoading(false);
  };

  const asignarServicio = async (servicio) => {
    if (!clienteId || !servicio) return false;

    const yaAsignado = servicios.some((s) => s.servicio === servicio);
    if (yaAsignado) {
      toast.error("Este servicio ya está asignado al cliente");
      return false;
    }

    const { data, error } = await supabase
      .from("clientes_servicio")
      .insert({
        cliente_id: clienteId,
        servicio,
      })
      .select();

    if (error || !data || !data[0]) {
      console.error(
        "Error al asignar servicio:",
        error?.message || "sin respuesta"
      );
      toast.error("No se pudo asignar el servicio");
      return false;
    }

    setServicios((prev) => [data[0], ...prev]);
    toast.success(`Servicio "${getLabel(servicio)}" asignado correctamente`);
    return true;
  };

  const eliminarServicio = async (servicioId) => {
    const { error } = await supabase
      .from("clientes_servicio")
      .delete()
      .eq("id", servicioId);

    if (error) {
      console.error("Error al eliminar servicio:", error.message);
      toast.error("No se pudo eliminar el servicio");
      return false;
    }

    setServicios((prev) => prev.filter((s) => s.id !== servicioId));
    toast.success("Servicio eliminado correctamente");
    return true;
  };

  useEffect(() => {
    fetchServicios();
  }, [clienteId]);

  return {
    servicios,
    loading,
    refetch: fetchServicios,
    asignarServicio,
    eliminarServicio,
  };
};
