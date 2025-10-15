import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CitasModal from "../components/domain/CitasModal";
import toast from 'react-hot-toast';
import Icon from "@/components/shared/Icons";
import { useCitas } from "@/hooks/useCitas";
import { useClientes } from "@/hooks/useClientes";
import { getDateForDay } from "@/helpers/dateHelpers";
import { useClienteServicio } from "@/hooks/useClienteServicio";
import { useServicioLabels } from "@/helpers/useServicioLabels";
import { useClientesServicioGlobal } from "@/hooks/useClientesServicioGlobal";
import GeneradorSeguimiento from "@/components/domain/GeneradorSeguimiento";
import ModalCrearCita from "@/components/domain/ModalCrearCita";

const hours = [
  "07:00:00",
  "08:00:00",
  "09:00:00",
  "10:00:00",
  "14:00:00",
  "15:00:00",
  "16:00:00",
  "17:00:00",
];
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const allowedHours = ["07", "08", "09", "10", "14", "15", "16", "17"];
const allowedMinutes = ["00", "15", "30", "45"];

const formatLocalDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getWeekRange = (date) => {
  const base = new Date(date);
  const dow = base.getDay();              // 0=domingo
  const offsetToMonday = dow === 0 ? -6 : 1 - dow;

  const monday = new Date(base);
  monday.setDate(base.getDate() + offsetToMonday);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  return {
    monday,
    friday,
    startDateStr: formatLocalDate(monday),
    endDateStr: formatLocalDate(friday),
  };
};


// Hook de React para debouncing
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

const getInitialMonday = () => {
  const today = new Date();
  const dow = today.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  today.setDate(today.getDate() + offset);
  return today;
};

export default function HorarioMedico() {
  const [mode, setMode] = useState("view");
  const [selectedDate, setSelectedDate] = useState(getInitialMonday());
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({ hora: "" });
  const { clientes, refetch: refetchClientes } = useClientes();
  const { startDateStr, endDateStr } = getWeekRange(selectedDate);
  const { getLabel } = useServicioLabels();
  const { citas, addCita, updateCita, deleteCita, refetch: refetchCitas } = useCitas(startDateStr, endDateStr);
  const { servicios } = useClienteServicio(selectedClient?.id);
  const { serviciosGlobales } = useClientesServicioGlobal();
  const clientesConServicio = useMemo(() => {
    const conServicioIds = new Set(serviciosGlobales.map(s => s.cliente_id));
    return clientes.filter(c => conServicioIds.has(c.id));
  }, [clientes, serviciosGlobales]);
  const headerScrollRef = useRef(null);
  const gridScrollRef = useRef(null);



  const now = new Date();
  const colombiaOffsetMs = 5 * 60 * 60 * 1000; // UTC-5
  const colombiaDate = new Date(now.getTime() - colombiaOffsetMs);
  const colombiaISOString = colombiaDate.toISOString();

  useEffect(() => {
    const header = headerScrollRef.current;
    const grid = gridScrollRef.current;
    if (!header || !grid) return;

    let syncing = false;

    const syncScroll = (source, target) => {
      if (syncing) return;
      syncing = true;
      target.scrollLeft = source.scrollLeft;
      requestAnimationFrame(() => {
        syncing = false;
      });
    };

    const onGridScroll = () => syncScroll(grid, header);
    const onHeaderScroll = () => syncScroll(header, grid);

    grid.addEventListener("scroll", onGridScroll, { passive: true });
    header.addEventListener("scroll", onHeaderScroll, { passive: true });

    return () => {
      grid.removeEventListener("scroll", onGridScroll);
      header.removeEventListener("scroll", onHeaderScroll);
    };
  }, []);


  const citasByDate = useMemo(() => {
    return citas.reduce((acc, cita) => {
      const dateKey = `${cita.fecha}-${cita.hora.slice(0, 2)}`;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(cita);
      return acc;
    }, {});
  }, [citas]);

  const citasByDay = useMemo(() => {
    return citas.reduce((acc, cita) => {
      if (!acc[cita.fecha]) {
        acc[cita.fecha] = [];
      }
      acc[cita.fecha].push(cita);
      return acc;
    }, {});
  }, [citas]);

  const handleAddCita = useCallback((day, hour) => {
    setFormData({ hora: hour.slice(0, 5) });
    setSelectedClient(null);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedCell({ day, hour });
    setSelectedDay(null);
    setShowForm(true);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const { hora } = formData;

      if (!hora) return;
      if (!selectedClient?.id) {
        toast.error("Debes seleccionar un cliente antes de guardar la cita");
        return;
      }
      if (!selectedCell?.day) {
        toast.error("No se ha seleccionado una celda válida");
        return;
      }

      const nuevaCita = {
        clientes_servicio_id: formData.servicioId,
        fecha: getDateForDay(selectedDate, selectedCell.day),
        hora: hora + ":00",
        estado: "programada",
        created_at: colombiaISOString,
        updated_at: colombiaISOString
      };


      const success = await addCita(nuevaCita);
      if (success) {
        toast.success(`Cita para ${selectedClient.nombre} añadida a las ${hora}`);
        setShowForm(false);
        setSelectedClient(null);
        setFormData({ hora: "" });
        await refetchCitas();
      } else {
        toast.error("Hubo un problema al guardar la cita");
      }
    },
    [formData, selectedCell, selectedDate, selectedClient, addCita, refetchCitas]
  );



  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedAppointment?.id) return;

    const { fecha, hora, estado, clientes_servicio_id } = selectedAppointment;

    const citaActualizada = {
      fecha,
      hora: hora.split(":").length === 2 ? hora + ":00" : hora,
      estado,
      clientes_servicio_id,
      updated_at: new Date().toISOString()
    };


    const success = await updateCita(selectedAppointment.id, citaActualizada);
    if (success) {
      setShowEditModal(false);
      setSelectedAppointment(null);
      toast.success("Cita actualizada correctamente");
      await refetchCitas();
    } else {
      toast.error("Hubo un problema al actualizar la cita");
    }
  }, [selectedAppointment, updateCita, refetchCitas]);


  const handleDelete = useCallback(async () => {
    const citaId = selectedAppointment?.id || selectedAppointment?.docId;
    if (!citaId) return;

    const success = await deleteCita(citaId);
    if (success) {
      setShowEditModal(false);
      setSelectedAppointment(null);
      toast.success("Cita eliminada correctamente");
      await refetchCitas();
    } else {
      toast.error("Hubo un problema al eliminar la cita");
    }
  }, [selectedAppointment, deleteCita, refetchCitas]);


  const semanaActual = useMemo(() => {
    const { monday, friday } = getWeekRange(selectedDate);
    return `${monday.toLocaleDateString()} al ${friday.toLocaleDateString()}`;
  }, [selectedDate]);


  const cambiarSemana = useCallback((offset) => {
    setSelectedDate((prevDate) => {
      const nuevaFecha = new Date(prevDate);
      nuevaFecha.setDate(nuevaFecha.getDate() + offset * 7);
      return nuevaFecha;
    });
  }, []);

  // Lógica de búsqueda optimizada con debouncing
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
  }, [clientesConServicio]); // ← este era el error silencioso


  const debouncedSearch = useDebounce(searchClients, 300);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSearchTerm('');
    setSearchResults([]);
  };

  const validTimes = useMemo(() => {
    const allowedHours = ["07", "08", "09", "10", "14", "15", "16", "17"];
    const minutes = ["00", "15", "30", "45"];
    const result = [];

    allowedHours.forEach((hour) => {
      minutes.forEach((min) => {
        result.push(`${hour}:${min}`);
      });
    });

    return result; // Ej: ["07:00", "07:15", ..., "17:45"]
  }, []);


  return (

    <div className="p-2 w-full">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full mb-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-black">
            Semana de {semanaActual}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de agenda
          </p>
        </div>
        <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-4 md:items-center">
          <div className="md:flex md:justify-start">
            <Button
              className="w-full md:w-auto cursor-pointer text-blue-600 bg-blue-50 hover:bg-blue-200 font-medium"
              onClick={() => cambiarSemana(-1)}
            >
              ← Semana anterior
            </Button>
          </div>
          <div className="md:flex md:justify-center">
            <Button
              className="w-full md:w-40 cursor-pointer bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              onClick={() => setMode(mode === "view" ? "edit" : "view")}
            >
              {mode === "view" ? (
                <>
                  <Icon name="plus" />
                  Añadir Agenda
                </>
              ) : (
                <>
                  <Icon name="calendar" />
                  Ver Agenda
                </>
              )}
            </Button>
          </div>
          <div className="md:flex md:justify-end">
            <Button
              className="w-full md:w-auto cursor-pointer text-blue-600 bg-blue-50 hover:bg-blue-200 font-medium"
              onClick={() => cambiarSemana(1)}
            >
              Semana siguiente →
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-xl shadow-lg border border-gray-300 bg-white md:overflow-hidden overflow-visible">
        <div ref={headerScrollRef} className="overflow-x-auto no-scrollbar">
          <div className="grid grid-cols-[100px_repeat(5,minmax(0,1fr))] min-w-[700px] md:grid-cols-[160px_repeat(5,minmax(0,1fr))] bg-gray-100 border-b border-gray-300">
            <div className="sticky left-0 z-10 bg-gray-100 w-[100px] md:w-[160px] flex items-center justify-center 
            py-2 text-gray-600 text-sm font-medium">
              <Icon className="text-gray-500 mr-1" name={"clock"} />
              Horario
            </div>

            {days.map((day) => {
              const fechaStr = getDateForDay(selectedDate, day);
              const [y, m, d] = fechaStr.split("-").map(Number);
              const fecha = new Date(y, m - 1, d);
              const numeroDia = fecha.getDate();
              return (
                <div
                  key={day}
                  className="font-bold text-black bg-blue-100 hover:bg-blue-200 py-1 text-center cursor-pointer flex flex-col items-center"
                  onClick={() => {
                    setSelectedDay(day);
                    setSelectedCell(null);
                    setShowModal(true);
                  }}
                >
                  <span>{day}</span>
                  <span className="text-sm text-gray-600 font-normal">{numeroDia}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div
          ref={gridScrollRef}
          className="max-h-[400px] overflow-y-auto overflow-x-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="min-w-[700px] grid grid-cols-[100px_repeat(5,minmax(0,1fr))] md:grid-cols-[160px_repeat(5,minmax(0,1fr))]">
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                {/* Columna de hora sticky */}
                <div className="border-b border-white font-bold text-white flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500 text-white border-r border-gray-200 sticky left-0 z-10">
                  {hour.slice(0, 5)}
                </div>

                {/* Celdas por día */}
                {days.map((day) => {
                  const fecha = getDateForDay(selectedDate, day);
                  const citasEnCelda = citasByDate[`${fecha}-${hour.slice(0, 2)}`] || [];
                  const tieneCitas = citasEnCelda.length > 0;

                  return (
                    <Card
                      key={day + hour}
                      className={`cursor-pointer h-20 flex items-center justify-center text-sm transition-colors rounded-lg ${mode === "edit"
                        ? "bg-yellow-300 hover:bg-yellow-500"
                        : tieneCitas
                          ? "bg-green-400 hover:bg-green-500"
                          : "bg-blue-50 hover:bg-blue-100"
                        }`}
                      onClick={() => {
                        setSelectedCell({ day, hour });
                        setSelectedDay(null);
                        if (mode === "edit") {
                          handleAddCita(day, hour);
                        } else {
                          setShowModal(true);
                        }
                      }}
                    >
                      <CardContent className="text-center">
                        {mode === "edit" ? (
                          <p className="text-gray-800 font-medium flex flex-col items-center">
                            <Icon name={"plus"} size={20} />Añadir Nuevo
                          </p>
                        ) : tieneCitas ? (
                          <p className="font-semibold text-gray-800">
                            {citasEnCelda.length} {citasEnCelda.length === 1 ? "Cita" : "Citas"}
                          </p>
                        ) : (
                          <p className="text-gray-500">Sin citas</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <GeneradorSeguimiento citas={citas} />
      </div>     
      
      <CitasModal
        selectedDay={selectedDay}
        selectedCell={selectedCell}
        selectedDate={selectedDate}
        showModal={showModal}
        setShowModal={setShowModal}
        citasByDate={citasByDate}
        citasByDay={citasByDay}
        setShowEditModal={setShowEditModal}
        setSelectedAppointment={setSelectedAppointment}
        showEditModal={showEditModal}
        selectedAppointment={selectedAppointment}
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
        setSelectedCell={setSelectedCell}
        setSelectedDay={setSelectedDay}
      />
      <ModalCrearCita
        showForm={showForm}
        selectedCell={selectedCell}
        selectedDate={selectedDate}
        selectedClient={selectedClient}
        searchTerm={searchTerm}
        searchResults={searchResults}
        formData={formData}
        servicios={servicios}
        allowedHours={allowedHours}
        allowedMinutes={allowedMinutes}
        getLabel={getLabel}
        handleSearchChange={handleSearchChange}
        handleSelectClient={handleSelectClient}
        setFormData={setFormData}
        setShowForm={setShowForm}
        handleSubmit={handleSubmit}
      />
    </div>

  );
}