import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useServicioLabels } from "@/helpers/useServicioLabels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { generarPDFCitas } from "../pdf/generarPDFCitas";


// --- Modal secundario: lista de citas por hora ---
const HourCitasModal = ({ show, onClose, citasHora, onEstadoChange, onGuardar }) => {
  if (!show) return null;
  const { getLabel } = useServicioLabels();

  const formatHora = (horaStr) => {
    if (!horaStr) return "—";
    const [h, m] = horaStr.split(":").map(Number);
    const periodo = h < 12 ? "AM" : "PM";
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${periodo}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-[700px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Citas de la hora seleccionada</h3>

        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Documento</th>
              <th className="p-2 text-left">Servicio</th>
              <th className="p-2 text-left">Hora</th>
              <th className="p-2 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {citasHora.map((cita) => (
              <tr key={cita.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{cita.clientes_servicio?.cliente?.nombre || "—"}</td>
                <td className="p-2">{cita.clientes_servicio?.cliente_id || "—"}</td>
                <td className="p-2">{getLabel(cita.clientes_servicio?.servicio) || "—"}</td>
                <td className="p-2">{formatHora(cita.hora) || "—"}</td>
                <td className="p-2 text-center">
                  <Select
                    value={cita.estado}
                    onValueChange={(v) => onEstadoChange(cita.id, v)}
                  >
                    <SelectTrigger className="w-[130px] mx-auto">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programada">Programada</SelectItem>
                      <SelectItem value="asistio">Asistió</SelectItem>
                      <SelectItem value="no-asistio">No asistió</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onGuardar}>Guardar</Button>
        </div>
      </div>
    </div>
  );
};


// --- Modal principal de asistencia ---
const AssistanceModal = ({
  showAssistanceModal,
  setShowAssistanceModal,
  citas,
  updateCita,
  refetchCitas,
}) => {
  if (!showAssistanceModal) return null;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [localCitas, setLocalCitas] = useState([]);
  const [showHourModal, setShowHourModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);

  const handleWorkdayChange = (date, dir) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + dir);
    while (newDate.getDay() === 0 || newDate.getDay() === 6) {
      newDate.setDate(newDate.getDate() + dir);
    }
    return newDate;
  };

  useEffect(() => {
    setLocalCitas(citas);
  }, [citas]);

  const handleEstadoChange = (id, estado) => {
    setLocalCitas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado, _modificado: true } : c))
    );
  };

  const handleGuardar = useCallback(async () => {
    const modificadas = localCitas.filter((c) => c._modificado);
    if (modificadas.length === 0) return toast.info("No hay cambios por guardar");

    for (const cita of modificadas) {
      try {
        const { id, fecha, hora, estado, clientes_servicio_id } = cita;
        const citaActualizada = {
          fecha,
          hora: hora.split(":").length === 2 ? hora + ":00" : hora,
          estado,
          clientes_servicio_id,
          updated_at: new Date().toISOString(),
        };
        const success = await updateCita(id, citaActualizada);
        success
          ? toast.success(`Cita actualizada`)
          : toast.error(`Error al actualizar cita`);
      } catch (err) {
        toast.error("Error en la actualización");
        console.error(err);
      }
    }

    await refetchCitas();
    setShowHourModal(false);
  }, [localCitas, updateCita, refetchCitas]);

  const handleDayChange = (dir) => {
    setSelectedDate((prev) => handleWorkdayChange(prev, dir));
  };

  const formattedHeader = `${selectedDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })}`;

  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const citasFiltradas = useMemo(
    () =>
      localCitas.filter((cita) => {
        const citaDate = new Date(cita.fecha).toISOString().split("T")[0];
        return citaDate === selectedDateStr;
      }),
    [localCitas, selectedDateStr]
  );

  const citasPorHora = (hora) =>
    citasFiltradas.filter((c) => c.hora?.startsWith(hora));

  // 🔹 Descargar PDF solo del día actual
  const handleDescargarPDF = () => {
    if (citasFiltradas.length === 0) {
      toast.error("No hay citas para este día");
      return;
    }

    const titulo = `SEGUIMIENTO DE CITAS - ${formattedHeader.toUpperCase()}`;
    const nombreArchivo = `citas_${selectedDateStr}.pdf`;
    generarPDFCitas(citasFiltradas, "día", { titulo, nombreArchivo });
  };

  const hours = ["07:00", "08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => setShowAssistanceModal(false)}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-[900px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleDayChange(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="font-semibold text-lg text-gray-800 capitalize">
              {formattedHeader}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => handleDayChange(1)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* 🔹 Botón Descargar */}
          <Button variant="outline" size="sm" onClick={handleDescargarPDF}>
            <Download className="w-4 h-4 mr-1" /> Descargar
          </Button>
        </div>

        {/* ===== HORAS ===== */}
        <div className="grid grid-cols-8 gap-3 text-center">
          {hours.map((hora) => {
            const citasHora = citasPorHora(hora);
            const count = citasHora.length;
            return (
              <div key={hora} className="flex flex-col items-center">
                <div className="font-medium text-gray-700">{hora}</div>
                <div
                  className={`mt-2 px-3 py-2 w-full border rounded-lg cursor-pointer transition text-sm ${
                    count === 0
                      ? "bg-gray-100 text-gray-500"
                      : "bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium"
                  }`}
                  onClick={() =>
                    count > 0 && (setSelectedHour(hora), setShowHourModal(true))
                  }
                >
                  {count === 0 ? "Sin citas" : `${count} cita${count > 1 ? "s" : ""}`}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={() => setShowAssistanceModal(false)}>
            Cerrar
          </Button>
        </div>

        <HourCitasModal
          show={showHourModal}
          onClose={() => setShowHourModal(false)}
          citasHora={citasFiltradas.filter((c) => c.hora?.startsWith(selectedHour))}
          onEstadoChange={handleEstadoChange}
          onGuardar={handleGuardar}
        />
      </div>
    </div>
  );
};

export default AssistanceModal;
