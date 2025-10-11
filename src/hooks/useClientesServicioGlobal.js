// src/hooks/useClientesServicioGlobal.js
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

export const useClientesServicioGlobal = () => {
  const [serviciosGlobales, setServiciosGlobales] = useState([]);

  const fetchServicios = async () => {
    const { data, error } = await supabase
      .from("clientes_servicio")
      .select("id, cliente_id, servicio");

    if (!error) {
      setServiciosGlobales(data || []);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  return {
    serviciosGlobales,
    refetchServiciosGlobales: fetchServicios,
  };
};
