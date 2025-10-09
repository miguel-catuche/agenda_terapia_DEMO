import React, { useMemo, useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { generarPDFCitas } from "./utils/generarPDFCitas";
import toast from "react-hot-toast";

const GeneradorSeguimiento = ({ citas }) => {
    const hoy = new Date();
    const años = Array.from({ length: 5 }, (_, i) => String(hoy.getFullYear() - 2 + i));
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [citasMensuales, setCitasMensuales] = useState([]);
    const [modo, setModo] = useState("semana");
    const [mes, setMes] = useState(String(hoy.getMonth() + 1).padStart(2, "0"));
    const [año, setAño] = useState(String(hoy.getFullYear()));

    const semanaActual = useMemo(() => {
        const getWeekRange = (date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(d.setDate(diffToMonday));
            const friday = new Date(monday);
            friday.setDate(monday.getDate() + 4);
            return {
                label: `${monday.toLocaleDateString("es-CO")} al ${friday.toLocaleDateString("es-CO")}`,
                inicio: new Date(monday.setHours(0, 0, 0, 0)),
                fin: new Date(friday.setHours(23, 59, 59, 999)),
            };
        };
        return getWeekRange(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        const cargarCitas = async () => {
            let inicio, fin;

            if (modo === "semana") {
                inicio = semanaActual.inicio.toISOString().slice(0, 10);
                fin = semanaActual.fin.toISOString().slice(0, 10);
            } else {
                const getUltimoDiaDelMes = (año, mes) =>
                    new Date(Number(año), Number(mes), 0).toISOString().slice(0, 10);

                inicio = `${año}-${mes}-01`;
                fin = getUltimoDiaDelMes(año, mes);
            }

            const { data, error } = await supabase
                .from("citas")
                .select(`
    id,
    fecha,
    hora,
    estado,
    clientes_servicio (
      cliente:clientes (
        id,
        nombre
      )
    )
  `)
                .gte("fecha", inicio)
                .lte("fecha", fin)
                .order("fecha", { ascending: true });


            if (!error) {
                setCitasMensuales(data);
            } else {
                console.error("Error al cargar citas:", error.message);
                setCitasMensuales([]);
            }
        };

        cargarCitas();
    }, [modo, semanaActual, mes, año]);



    const meses = [
        { label: "Enero", value: "01" },
        { label: "Febrero", value: "02" },
        { label: "Marzo", value: "03" },
        { label: "Abril", value: "04" },
        { label: "Mayo", value: "05" },
        { label: "Junio", value: "06" },
        { label: "Julio", value: "07" },
        { label: "Agosto", value: "08" },
        { label: "Septiembre", value: "09" },
        { label: "Octubre", value: "10" },
        { label: "Noviembre", value: "11" },
        { label: "Diciembre", value: "12" },
    ];


    const citasFiltradas = useMemo(() => {
        return citasMensuales;
    }, [citasMensuales]);



    const handleDescargarPDF = () => {

        if (citasFiltradas.length === 0) {
            toast.error("No hay citas para exportar");
            return;
        }
        const mesesTexto = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];

        const formatoFechaCorta = (fechaStr) => {
            const [año, mes, día] = fechaStr.split("-");
            return `${día}${mes}`;
        };

        const titulo =
            modo === "mes"
                ? `SEGUIMIENTO MENSUAL DE CITAS - ${mesesTexto[Number(mes) - 1].toUpperCase()} ${año}`
                : `SEGUIMIENTO SEMANAL DE CITAS - ${semanaActual.label.toUpperCase()}`;

        const nombreArchivo =
            modo === "mes"
                ? `seguimiento_mensual_${mesesTexto[Number(mes) - 1]}_${año}.pdf`
                : `seguimiento_semanal_${formatoFechaCorta(semanaActual.inicio.toISOString().slice(0, 10))}_${formatoFechaCorta(semanaActual.fin.toISOString().slice(0, 10))}.pdf`;


        generarPDFCitas(citasFiltradas, modo, { titulo, nombreArchivo });
    };


    return (
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-4 items-center w-full max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 text-center">
                Descargar seguimiento mensual o semanal
            </h3>

            {/* Selector de modo */}
            <select
                value={modo}
                onChange={(e) => setModo(e.target.value)}
                className="border rounded-lg px-1 py-2 text-sm w-full md:w-auto"
            >
                <option value="semana">Semana</option>
                <option value="mes">Mes</option>
            </select>

            {/* Controles según el modo */}
            {modo === "semana" && (
                <div className="flex flex-wrap gap-2 items-center justify-center w-full">
                    <button
                        onClick={() =>
                            setSelectedDate(prev => {
                                const nueva = new Date(prev);
                                nueva.setDate(nueva.getDate() - 7);
                                return nueva;
                            })
                        }
                        className="px-3 py-2 border rounded text-sm w-full md:w-auto"
                    >
                        ← Semana anterior
                    </button>

                    <div className="px-3 py-2 text-sm text-gray-700 font-medium text-center">
                        {semanaActual.label}
                    </div>

                    <button
                        onClick={() =>
                            setSelectedDate(prev => {
                                const nueva = new Date(prev);
                                nueva.setDate(nueva.getDate() + 7);
                                return nueva;
                            })
                        }
                        className="px-3 py-2 border rounded text-sm w-full md:w-auto"
                    >
                        Semana siguiente →
                    </button>

                    <button
                        onClick={() => setSelectedDate(new Date())}
                        className="px-3 py-2 border rounded text-sm text-blue-600 hover:bg-blue-50 w-full md:w-auto"
                    >
                        Hoy
                    </button>
                </div>
            )}

            {modo === "mes" && (
                <div className="flex flex-wrap gap-2 items-center justify-center w-full">
                    <select
                        value={mes}
                        onChange={(e) => setMes(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm w-full md:w-auto"
                    >
                        {meses.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>

                    <select
                        value={año}
                        onChange={(e) => setAño(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm w-full md:w-auto"
                    >
                        {años.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Botón de descarga */}
            <button
                onClick={handleDescargarPDF}
                className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition w-full md:w-auto"
            >
                Descargar PDF
            </button>
        </div>

    );
};

export default GeneradorSeguimiento;
