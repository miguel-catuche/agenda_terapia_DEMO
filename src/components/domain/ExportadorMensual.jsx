import React, { useState } from "react";

const ExportadorMensual = ({ citas, clientes }) => {
    const hoy = new Date();
    const [mes, setMes] = useState(String(hoy.getMonth() + 1).padStart(2, "0"));
    const añoActual = hoy.getFullYear();
    const [año, setAño] = useState(String(añoActual));
    const años = Array.from({ length: 5 }, (_, i) => String(añoActual - 2 + i)); // 3 atrás, 2 adelante


    const mesDiccionary = (mesElegido) => {
        switch (mesElegido) {
            case '01':
                return 'Enero';
            case '02':
                return 'Febrero';
            case '03':
                return 'Marzo';
            case '04':
                return 'Abril';
            case '05':
                return 'Mayo';
            case '06':
                return 'Junio';
            case '07':
                return 'Julio';
            case '08':
                return 'Agosto';
            case '09':
                return 'Septiembre';
            case '10':
                return 'Octubre';
            case '11':
                return 'Noviembre';
            case '12':
                return 'Diciembre';

        }
    }

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

    const calcularPorcentaje = (valor, total) =>
        total === 0 ? "0%" : `${Math.round((valor / total) * 100)}%`;

    const exportar = () => {
        if (!mes || !año) return alert("Selecciona mes y año");

        const fechaFiltro = `${año}-${mes}`;
        const citasMes = citas.filter(c => c.fecha?.startsWith(fechaFiltro));
        const clientesMes = clientes.filter(c => {
            if (!c.created_at) return false;
            const f = new Date(c.created_at);
            return f.getFullYear() === parseInt(año) && String(f.getMonth() + 1).padStart(2, "0") === mes;
        });

        const agendadas = citasMes.length;
        const programadas = citasMes.filter(c => c.estado === "programada").length;
        const asistieron = citasMes.filter(c => c.estado === "asistio").length;
        const noAsistieron = citasMes.filter(c => c.estado === "no-asistio").length;

        const nuevos = clientesMes.length;
        const terapia = clientesMes.filter(c => c.motivo === "Terapia").length;
        const valoracion = clientesMes.filter(c => c.motivo === "Valoracion").length;

        const porcentaje = (v, t) => t === 0 ? "0%" : `${Math.round((v / t) * 100)}%`;

        const csv = `
Resumen Mensual ${mesDiccionary(mes)} / ${año}
Total agendadas,${agendadas},100%
Estado,Valor,Porcentaje
Programadas,${programadas},${porcentaje(programadas, agendadas)}
Asistieron,${asistieron},${porcentaje(asistieron, agendadas)}
No asistieron,${noAsistieron},${porcentaje(noAsistieron, agendadas)}

Clientes Nuevos ${mesDiccionary(mes)} / ${año}
Total nuevos,${nuevos},100%
Motivo,Valor,Porcentaje
Terapia,${terapia},${porcentaje(terapia, nuevos)}
Valoracion,${valoracion},${porcentaje(valoracion, nuevos)}
`.trim();

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `resumen_${mes}_${año}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-4 items-center">
            <h3 className="text-lg font-semibold text-gray-800">Exportar resumen mensual</h3>
            <div className="flex flex-wrap gap-2 w-full justify-center">
                <select
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">Mes</option>
                    {meses.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>

                <select
                    value={año}
                    onChange={(e) => setAño(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">Año</option>
                    {años.map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}

                </select>

                <button
                    onClick={exportar}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg cursor-pointer"
                >
                    Exportar
                </button>
            </div>
        </div>
    );
};

export default ExportadorMensual;
