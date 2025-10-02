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
                .select("*, cliente:clientes(id, nombre)")
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
        console.log("Ejemplo de cita:", citas[0]);
        console.log("Citas filtradas:", citasFiltradas);

        if (citasFiltradas.length === 0) {
            toast.error("No hay citas para exportar");
            return;
        }

        generarPDFCitas(citasFiltradas, modo); // 👈 ahora pasamos el modo
    };


    return (
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-4 items-center">
            <h3 className="text-lg font-semibold text-gray-800">Generar seguimiento institucional</h3>

            <div className="flex flex-wrap gap-2 w-full justify-center">
                <select
                    value={modo}
                    onChange={(e) => setModo(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="semana">Semana actual</option>
                    <option value="mes">Mes específico</option>
                </select>

                {modo === "semana" && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 7)))}
                            className="px-2 py-1 border rounded text-sm"
                        >
                            ← Semana anterior
                        </button>

                        <div className="px-3 py-2 text-sm text-gray-700 font-medium">
                            {semanaActual.label}
                        </div>

                        <button
                            onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 7)))}
                            className="px-2 py-1 border rounded text-sm"
                        >
                            Semana siguiente →
                        </button>
                    </div>
                )}
                {modo === "mes" && (
                    <>
                        <select
                            value={mes}
                            onChange={(e) => setMes(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm"
                        >
                            {meses.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>

                        <select
                            value={año}
                            onChange={(e) => setAño(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm"
                        >
                            {años.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </>
                )}
            </div>

            <button
                onClick={handleDescargarPDF}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
                Descargar PDF
            </button>

        </div>
    );
};

export default GeneradorSeguimiento;
