import React, { useMemo, useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import HistorialSemanalDocumento from "./HistorialSemanalDocumento";

const GeneradorSeguimiento = ({ citas, selectedDate }) => {
    const hoy = new Date();
    const [modo, setModo] = useState("semana");
    const [mes, setMes] = useState(String(hoy.getMonth() + 1).padStart(2, "0"));
    const [año, setAño] = useState(String(hoy.getFullYear()));
    const docRef = useRef(null);
    const [renderDocumento, setRenderDocumento] = useState(false);

    const años = Array.from({ length: 5 }, (_, i) => String(hoy.getFullYear() - 2 + i));

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

    useEffect(() => {
        if (renderDocumento && docRef.current) {
            const opt = {
                margin: 0.5,
                filename: "seguimiento_semanal.pdf",
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
            };

            // Espera breve para asegurar render completo
            setTimeout(() => {
                html2pdf().set(opt).from(docRef.current).save();
                setRenderDocumento(false);
            }, 500);
        }
    }, [renderDocumento]);

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

    const citasFiltradas = useMemo(() => {
        if (modo === "semana") {
            return citas.filter(c => {
                const fecha = new Date(`${c.fecha}T${c.hora}`);
                return fecha >= semanaActual.inicio && fecha <= semanaActual.fin;
            });
        } else {
            const filtro = `${año}-${mes}`;
            return citas.filter(c => c.fecha?.startsWith(filtro));
        }
    }, [modo, citas, semanaActual, mes, año]);

    const handleDescargarPDF = () => {
        if (citasFiltradas.length === 0) {
            alert("No hay citas para exportar");
            return;
        }

        setRenderDocumento(true);
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
                    <div className="px-3 py-2 text-sm text-gray-700 font-medium">
                        {semanaActual.label}
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

            {renderDocumento && (
                <div ref={docRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>
                    <HistorialSemanalDocumento citas={citasFiltradas} />
                </div>
            )}

        </div>
    );
};

export default GeneradorSeguimiento;
