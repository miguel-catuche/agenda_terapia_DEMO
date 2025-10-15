import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/shared/Icons";

export default function ModalNuevaCita({
  showForm,
  selectedClient,
  searchTerm,
  searchResults,
  formData,
  servicios,
  allowedHours,
  allowedMinutes,
  getLabel,
  handleSearchChange,
  handleSelectClient,
  setFormData,
  setShowForm,
  handleSubmit,
  isSubmitting
}) {
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
      <div className="bg-white rounded-xl shadow-lg p-6 w-84 md:w-96" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold mb-2 text-gray-800">Crear nueva cita</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          {selectedClient ? (
            <>
              <div>
                <label className="block text-sm text-gray-700">Nombre del paciente</label>
                <Input type="text" value={selectedClient.nombre} readOnly className="bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Número de documento</label>
                <Input type="text" value={selectedClient.id} readOnly className="bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio asignado</label>
                <select
                  value={formData.servicioId || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, servicioId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                >
                  <option value="" disabled>Selecciona un servicio</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>{getLabel(s.servicio)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <Input
                  type="date"
                  value={formData.fecha || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <select
                    value={formData.hora.split(":")[0] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hora: `${e.target.value}:${prev.hora.split(":")[1] || "00"}`,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                  >
                    <option value="">--</option>
                    {allowedHours.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minutos</label>
                  <select
                    value={formData.hora.split(":")[1] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hora: `${prev.hora.split(":")[0] || ""}:${e.target.value}`,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                  >
                    <option value="">--</option>
                    {allowedMinutes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button className={"cursor-pointer"} type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button
                  className="cursor-pointer bg-green-600 hover:bg-green-700"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>

              </div>
            </>
          ) : (
            <>
              <label className="block text-sm text-gray-700">Buscar paciente</label>
              <div className="relative w-full mt-3">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o documento..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
              {searchResults.length > 0 && (
                <ul className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                  {searchResults.map(client => (
                    <li key={client.id} className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectClient(client)}>
                      {client.nombre} (Doc: {client.id})
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
