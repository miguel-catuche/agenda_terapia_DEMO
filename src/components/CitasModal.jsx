// src/components/CitasModal.jsx
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDateForDay } from "@/helpers/dateHelpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper para obtener las clases de color de fondo
const getEstadoClasses = (estado) => {
  switch (estado) {
    case 'cancelada':
      return 'bg-red-200 border border-red-300 text-red-900 font-semibold';
    case 'no-se-presento':
      return 'bg-orange-200 border border-orange-300 text-orange-900 font-semibold';
    case 'programada':
      return 'bg-blue-200 border border-blue-300 text-blue-800 font-semibold';
    case 'completada':
      return 'bg-green-200 border border-green-300 text-green-900 font-semibold';
    default:
      return 'bg-gray-200';
  }
};

const estadoLabels = {
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
  "no-se-presento": "No se presentó",
};

const motivoLabels = {
  Terapia: "Terapia",
  Valoracion: "Valoración"
}

const getMotivoColors = (motivo) => {
  switch (motivo) {
    case "Terapia":
      return 'bg-amber-100 text-amber-800';
    case "Valoracion":
      return 'bg-sky-100 text-sky-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};


const allowedHours = ["07", "08", "09", "10", "14", "15", "16", "17"];
const allowedMinutes = ["00", "15", "30", "45"];


const CitasModal = ({
  selectedDay,
  selectedCell,
  setSelectedDay,
  selectedDate,
  showModal,
  setShowModal,
  citasByDate,
  citasByDay,
  setShowEditModal,
  setSelectedAppointment,
  showEditModal,
  selectedAppointment,
  handleUpdate,
  handleDelete,
  setSelectedCell,
  clientes
}) => {
  // SVG del ícono de ojo
  const EyeIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-eye-icon lucide-eye text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

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
  const clave =
    selectedCell?.day && selectedCell?.hour
      ? `${getDateForDay(selectedDate, selectedCell.day)}-${selectedCell.hour.slice(0, 2)}`
      : null;
  const citas = citasByDate[clave] || [];

  return (

    <>
      {/* Modal de citas por hora */}
      {showModal && selectedCell && !selectedDay && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-96">
            <h3 className="font-bold mb-2 text-gray-800">
              Citas en {selectedCell.day} a las {selectedCell.hour.slice(0, 5)}
            </h3>
            {citas.length === 0 ? (
              <p className="text-gray-500">No hay citas</p>
            ) : (
              <ul className="text-sm space-y-2 flex flex-col items-start w-full">
                {citasByDate[`${getDateForDay(selectedDate, selectedCell.day)}-${selectedCell.hour.slice(0, 2)}`]?.map((c) => {
                  const cliente = clientes?.find((cl) => cl.id === c.cliente_id);
                  return (
                    <li key={c.id} className={`w-full max-w-[22rem] text-left flex justify-between items-center px-4 py-2 rounded-lg ${getEstadoClasses(c.estado)}`}>
                      <div>
                        {c.nombre} - Hora: {c.hora.slice(0, 5)} - Estado: {estadoLabels[c.estado] || c.estado}
                        {cliente?.motivo && (
                          <div className={`text-xs mt-1 rounded w-fit px-2 text-center ${getMotivoColors(cliente.motivo)}`}>
                            Motivo: {motivoLabels[cliente.motivo] || cliente.motivo}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 pl-2">
                        <span onClick={() => {
                          setSelectedAppointment({ ...c, fecha: c.fecha, hora: c.hora.slice(0, 5) });
                          setShowEditModal(true);
                          setShowModal(false);
                        }}>
                          <EyeIcon />
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            <div className="flex justify-end mt-4">
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedCell(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de citas por día */}
      {showModal && selectedDay && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-[28rem] max-h-[80vh] flex flex-col">
            <h3 className="font-bold mb-4 text-gray-800">Número de Citas para el {selectedDay} = {citasByDay[getDateForDay(selectedDate, selectedDay)]?.length} </h3>
            {citasByDay[getDateForDay(selectedDate, selectedDay)]?.length === 0 ? (
              <p className="text-gray-500">No hay citas este día</p>
            ) : (
              <div className="overflow-y-auto pr-2 flex-grow">
                <div className="space-y-3">
                  {hours.map((hour) => {
                    const citasHora = citasByDate[`${getDateForDay(selectedDate, selectedDay)}-${hour.slice(0, 2)}`] || [];
                    return (
                      <div key={hour}>
                        <p className="font-semibold text-gray-700">{hour.slice(0, 5)}</p>
                        {citasHora.length === 0 ? (
                          <p className="text-gray-400 text-sm">Sin citas</p>
                        ) : (
                          <ul className="text-sm space-y-2 flex flex-col items-start">
                            {citasHora.map((c) => {
                              const cliente = clientes?.find((cl) => cl.id === c.cliente_id);
                              return (
                                <li key={c.id} className={`w-full max-w-[24rem] text-left text-gray-900 flex justify-between items-center px-4 py-2 rounded-lg ${getEstadoClasses(c.estado)}`}>
                                  <div>
                                    {c.nombre} - Hora: {c.hora.slice(0, 5)} - Estado: {estadoLabels[c.estado] || c.estado}
                                    {cliente?.motivo && (
                                      <div className={`text-xs mt-1 rounded w-fit px-2 text-center ${getMotivoColors(cliente.motivo)}`}>
                                        Motivo: {motivoLabels[cliente.motivo] || cliente.motivo}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span onClick={() => {
                                      setSelectedAppointment({ ...c, fecha: c.fecha, hora: c.hora.slice(0, 5) });
                                      setShowEditModal(true);
                                      setShowModal(false);
                                    }}>
                                      <EyeIcon />
                                    </span>
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedDay(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para EDITAR, ELIMINAR y VER citas (con campos de documento y nombre deshabilitados) */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 md:w-96">
            <h3 className="font-bold mb-4 text-gray-800 text-center">
              Gestionar Cita
            </h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700">Nombre del paciente</label>
                <Input
                  type="text"
                  value={selectedAppointment.nombre}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Número de documento</label>
                <Input
                  type="text"
                  value={selectedAppointment.cliente_id}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Fecha de la cita</label>
                <Input
                  type="date"
                  value={selectedAppointment.fecha}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, fecha: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Select de hora */}
                <div>
                  <label className="block text-sm text-gray-700">Hora</label>
                  <select
                    value={selectedAppointment.hora.split(":")[0]}
                    onChange={(e) =>
                      setSelectedAppointment((prev) => ({
                        ...prev,
                        hora: `${e.target.value}:${prev.hora.split(":")[1] || "00"}:00`,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                  >
                    <option value="">--</option>
                    {allowedHours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Minutos</label>
                  <select
                    value={selectedAppointment.hora.split(":")[1]}
                    onChange={(e) =>
                      setSelectedAppointment((prev) => ({
                        ...prev,
                        hora: `${prev.hora.split(":")[0] || "07"}:${e.target.value}:00`,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                  >
                    <option value="">--</option>
                    {allowedMinutes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Estado</label>
                <Select
                  value={selectedAppointment.estado}
                  onValueChange={(value) => setSelectedAppointment({ ...selectedAppointment, estado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="no-se-presento">No se presentó</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>

                </Select>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-2">
                <div className="flex md:gap-3 justify-center gap-4">
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="cursor-pointer flex-1">
                    Cancelar
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete} className="cursor-pointer flex-1 hover:bg-red-700">
                  Eliminar
                </Button>                  
                </div>
                <Button type="submit" className="cursor-pointer bg-green-600 hover:bg-green-700">Guardar Cambios</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CitasModal;