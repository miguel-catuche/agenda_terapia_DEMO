import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useCitas } from "./useCitas";

export function useAgendarCita(clientes, serviciosGlobales) {
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({ hora: "", fecha: "", servicioId: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const { addCita, refetch } = useCitas();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientesConServicio = useMemo(() => {
    const conServicioIds = new Set(serviciosGlobales.map(s => s.cliente_id));
    return clientes.filter(c => conServicioIds.has(c.id));
  }, [clientes, serviciosGlobales]);

  const searchClients = useCallback((term) => {
    if (term.length > 0) {
      const results = clientesConServicio.filter(client =>
        client.nombre.toLowerCase().includes(term.toLowerCase()) ||
        client.id.includes(term)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [clientesConServicio]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    searchClients(e.target.value);
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSearchTerm("");
    setSearchResults([]);
  };

  const openModal = () => {
    setFormData({ hora: "", fecha: "", servicioId: "" });
    setSelectedClient(null);
    setSearchTerm("");
    setSearchResults([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    e.preventDefault();
    const { hora, fecha, servicioId } = formData;
    if (!hora || !fecha || !selectedClient?.id || !servicioId) return;

    const nuevaCita = {
      clientes_servicio_id: servicioId,
      fecha,
      hora: hora + ":00",
      estado: "programada",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const success = await addCita(nuevaCita);
    if (success) {
      toast.success(`Cita para ${selectedClient.nombre} añadida`);
      setShowForm(false);
      setSelectedClient(null);
      setFormData({ hora: "", fecha: "", servicioId: "" });
      await refetch();
    } else {
      toast.error("Error al guardar la cita");
    }
    setIsSubmitting(false);
  };

  const serviciosAsignados = useMemo(() => {
  if (!selectedClient?.id) return [];
  return serviciosGlobales.filter(s => s.cliente_id === selectedClient.id);
}, [selectedClient, serviciosGlobales]);


  return {
    showForm,
    selectedClient,
    formData,
    searchTerm,
    searchResults,
    servicios: serviciosAsignados,
    isSubmitting,
    setFormData,
    setShowForm,
    handleSearchChange,
    handleSelectClient,
    handleSubmit,
    openModal
  };
}
