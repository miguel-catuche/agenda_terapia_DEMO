import { useState } from "react";
import toast from "react-hot-toast";
import { useCitas } from "./useCitas";

export function useAgendarCitasMultiples(selectedClient) {
  const { addCita, refetch } = useCitas();
  const [isSubmittingMultiple, setIsSubmittingMultiple] = useState(false);

  const submitMultiple = async (citasFinales) => {
    if (!selectedClient?.id) {
      toast.error("No hay paciente seleccionado");
      return false;
    }

    setIsSubmittingMultiple(true);

    try {
      for (const cita of citasFinales) {
        const { hora, fecha, servicioId } = cita;

        const nuevaCita = {
          clientes_servicio_id: servicioId,
          fecha,
          hora: `${hora}:00`,
          estado: "programada",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const ok = await addCita(nuevaCita);

        if (!ok) {
          toast.error("No se pudo guardar una de las citas");
          setIsSubmittingMultiple(false);
          return false;
        }
      }

      toast.success(`Se guardaron ${citasFinales.length} citas correctamente`);
      await refetch();
      setIsSubmittingMultiple(false);
      return true;

    } catch (err) {
      console.error("Error guardando citas múltiples", err);
      toast.error("Error inesperado");
      setIsSubmittingMultiple(false);
      return false;
    }
  };

  return {
    submitMultiple,
    isSubmittingMultiple
  };
}
