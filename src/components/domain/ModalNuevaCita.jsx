/* --------------  MODAL NUEVA CITA (COMPLETO) --------------- */

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/shared/Icons";
import { useAgendarCitasMultiples } from "@/hooks/useAgendarCitasMultiples";
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  parseISO
} from "date-fns";
import { es } from "date-fns/locale";

export default function ModalNuevaCita({
  showForm,
  selectedClient,
  searchTerm,
  searchResults,
  servicios = [],
  allowedHours = ["07", "08", "09", "10", "14", "15", "16", "17"],
  allowedMinutes = ["00", "15", "30", "45"],
  getLabel = (s) => s,
  handleSearchChange,
  handleSelectClient,
  setShowForm
}) {
  const { submitMultiple, isSubmittingMultiple } =
    useAgendarCitasMultiples(selectedClient);

  const [cantidad, setCantidad] = useState(1);
  const [servicioGlobal, setServicioGlobal] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [diasMes, setDiasMes] = useState([]);
  const [citasData, setCitasData] = useState([]); // aquí vive el calendario

  useEffect(() => {
    const inicio = startOfMonth(currentMonth);
    const fin = endOfMonth(currentMonth);
    setDiasMes(eachDayOfInterval({ start: inicio, end: fin }));
  }, [currentMonth]);

  /* --------------------------
      FIX REAL DEL TOGGLE
      - 0 citas → agrega 1
      - 1 cita → elimina todas
      - 2 citas → pasa a 1
  -------------------------- */
  const toggleDia = (diaObj) => {
    const dia = format(diaObj, "yyyy-MM-dd");
    const citasEseDia = citasData.filter((c) => c.fecha === dia);
    const total = citasData.length;

    // --------------------------
    // ESTADO 0 → 1
    // --------------------------
    if (citasEseDia.length === 0) {
      if (total >= cantidad) return; // no permitir agregar
      setCitasData((prev) => [
        ...prev,
        {
          fecha: dia,
          hora: `${allowedHours[0] || "07"}:${allowedMinutes[0] || "00"}`
        }
      ]);
      return;
    }

    // --------------------------
    // ESTADO 1 → 2
    // --------------------------
    if (citasEseDia.length === 1) {
      if (total >= cantidad) {
        // máximo alcanzado → este click elimina la única cita
        setCitasData((prev) => prev.filter((c) => c.fecha !== dia));
        return;
      }

      // se puede agregar la segunda cita
      setCitasData((prev) => [
        ...prev,
        {
          fecha: dia,
          hora: `${allowedHours[0] || "07"}:${allowedMinutes[0] || "00"}`
        }
      ]);
      return;
    }

    // --------------------------
    // ESTADO 2 → 0
    // --------------------------
    if (citasEseDia.length === 2) {
      // simple: eliminar todas las del día
      setCitasData((prev) => prev.filter((c) => c.fecha !== dia));
      return;
    }
  };



  const actualizarCita = (index, campo, valor) => {
    setCitasData((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  };

  const limpiarTodo = () => {
    setServicioGlobal("");
    setCantidad(1);
    setCitasData([]);
    setCurrentMonth(new Date());
  };

  const enviar = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!servicioGlobal) return;

    const dataFinal = citasData.map((c) => ({
      fecha: c.fecha,
      hora: c.hora,
      servicioId: servicioGlobal
    }));

    await submitMultiple(dataFinal);

    limpiarTodo();
    setShowForm(false);
  };

  if (!showForm) return null;

  const weekdayHeader = ["L", "M", "X", "J", "V", "S", "D"];

  const firstWeekdayShift = (date) => {
    const raw = getDay(startOfMonth(date));
    return raw === 0 ? 6 : raw - 1;
  };

  const blanks = firstWeekdayShift(currentMonth);

  const formattedMonth = format(currentMonth, "MMMM yyyy", { locale: es });
  const monthCapitalized =
    formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => {
        limpiarTodo();
        setShowForm(false);
      }}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-[1000px] max-h-[90vh] overflow-y-auto relative z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold mb-4 text-gray-800 text-xl">
          Agendar citas múltiples
        </h3>

        {/* BUSCAR CLIENTE */}
        {!selectedClient && (
          <>
            <label className="block text-sm text-gray-700">
              Buscar paciente
            </label>
            <div className="relative w-full mt-3">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Buscar por nombre o documento..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10"
              />
            </div>

            {searchResults.length > 0 && (
              <ul className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                {searchResults.map((client) => (
                  <li
                    key={client.id}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSelectClient(client)}
                  >
                    {client.nombre} (Doc: {client.id})
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* FORMULARIO PRINCIPAL */}
        {selectedClient && (
          <form onSubmit={enviar} className="relative">
            <div className="flex gap-8">
              {/* IZQUIERDA */}
              <div className="w-1/2 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700">
                    Nombre del paciente
                  </label>
                  <Input
                    value={selectedClient.nombre}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700">Documento</label>
                  <Input
                    value={selectedClient.id}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Servicio asignado (todas las citas)
                  </label>
                  <select
                    value={servicioGlobal}
                    onChange={(e) => setServicioGlobal(e.target.value)}
                    className="border rounded px-3 py-2 w-full mt-1"
                    required
                  >
                    <option value="">Selecciona un servicio</option>
                    {servicios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {getLabel(s.servicio)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cantidad de citas a agendar
                  </label>
                  <select
                    className="border rounded px-3 py-2 mt-1 w-full"
                    value={cantidad}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCantidad(val);
                      if (citasData.length > val)
                        setCitasData((c) => c.slice(0, val));
                    }}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DERECHA - CALENDARIO */}
              <div className="w-1/2 space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                  >
                    ←
                  </Button>

                  <div className="text-lg font-semibold">{monthCapitalized}</div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    →
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {weekdayHeader.map((d, idx) => (
                    <div key={idx} className="text-gray-500 text-sm font-medium">
                      {d}
                    </div>
                  ))}

                  {Array.from({ length: blanks }).map((_, i) => (
                    <div key={`blank-${i}`} className="p-2"></div>
                  ))}

                  {diasMes.map((diaObj, i) => {
                    const diaStr = format(diaObj, "yyyy-MM-dd");

                    const citasEseDia = citasData.filter(
                      (c) => c.fecha === diaStr
                    ).length;

                    // Colores dinámicos
                    const color =
                      citasEseDia === 0
                        ? ""
                        : citasEseDia === 1
                          ? "!bg-blue-600 !text-white !hover:bg-blue-700"
                          : "!bg-green-600 !text-white !hover:bg-green-700";

                    /* FIX IMPORTANTE:
                       - Solo bloquear días sin citas cuando ya se llegó al máximo
                       - Los días con 1 o 2 citas NUNCA se bloquean, para permitir toggles
                    */
                    const disabled =
                      citasEseDia === 0 && citasData.length >= cantidad;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDia(diaObj)}
                        disabled={disabled}
                        className={`p-2 rounded border text-sm select-none ${color} ${disabled ? "opacity-40 cursor-not-allowed" : ""
                          }`}
                      >
                        {format(diaObj, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LISTA DE CITAS GENERADAS */}
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {citasData.map((cita, i) => {
                  const dateObj = parseISO(cita.fecha);
                  return (
                    <div
                      key={i}
                      className="p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold">
                          Cita #{i + 1} —{" "}
                          {format(dateObj, "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setCitasData((prev) => {
                              const copy = [...prev];
                              copy.splice(i, 1);
                              return copy;
                            })
                          }
                          className="text-red-500 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Hora
                          </label>
                          <select
                            value={cita.hora.split(":")[0]}
                            onChange={(e) =>
                              actualizarCita(
                                i,
                                "hora",
                                `${e.target.value}:${cita.hora.split(":")[1]}`
                              )
                            }
                            className="border rounded px-3 py-2 w-full"
                            required
                          >
                            {allowedHours.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Minutos
                          </label>
                          <select
                            value={cita.hora.split(":")[1]}
                            onChange={(e) =>
                              actualizarCita(
                                i,
                                "hora",
                                `${cita.hora.split(":")[0]}:${e.target.value}`
                              )
                            }
                            className="border rounded px-3 py-2 w-full"
                            required
                          >
                            {allowedMinutes.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  limpiarTodo();
                  setShowForm(false);
                }}
              >
                Cancelar
              </Button>

              <Button
                className="bg-green-600 hover:bg-green-700"
                type="submit"
                disabled={isSubmittingMultiple}
              >
                {isSubmittingMultiple ? "Guardando..." : "Guardar citas"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
