import React from "react";
import DonutCard from "@/components/domain/DonutCard";
import Icon from "@/components/shared/Icons";
import { useClientes } from "@/hooks/useClientes";
import { useCitas } from "@/hooks/useCitas";
import ExportadorMensual from "@/components/domain/ExportadorMensual";

const Metricas = () => {
    const { clientes } = useClientes();
    const hoy = new Date();
    const añoActual = hoy.getFullYear();

    const getSemanaRange = (baseDate) => {
        const base = new Date(baseDate);
        const dow = base.getDay();
        const offsetToMonday = dow === 0 ? -6 : 1 - dow;
        const monday = new Date(base);
        monday.setDate(base.getDate() + offsetToMonday);
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);

        const format = (d) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        return {
            startDateStr: format(monday),
            endDateStr: format(friday),
        };
    };

    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
    const { startDateStr, endDateStr } = getSemanaRange(hoy);

    const mesInicio = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`;
    const mesFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().slice(0, 10);

    const { citas: citasSemana } = useCitas(startDateStr, endDateStr);
    const { citas: citasMes } = useCitas(mesInicio, mesFin);
    const { citas: citasHoy } = useCitas(hoyStr, hoyStr);
    const { citas: citasAnuales } = useCitas(`${añoActual}-01-01`, `${añoActual}-12-31`);

    const normalizar = (estado) => estado?.toLowerCase().replace(/\s/g, "-");

    const agendadasSemana = citasSemana.length;
    const programadaSemana = citasSemana.filter(c => normalizar(c.estado) === "programada").length;
    const asistioSemana = citasSemana.filter(c => normalizar(c.estado) === "asistio").length;
    const noAsistioSemana = citasSemana.filter(c => normalizar(c.estado) === "no-asistio").length;

    const agendadasMes = citasMes.length;
    const programadaMes = citasMes.filter(c => normalizar(c.estado) === "programada").length;
    const asistioMes = citasMes.filter(c => normalizar(c.estado) === "asistio").length;
    const noAsistioMes = citasMes.filter(c => normalizar(c.estado) === "no-asistio").length;

    const nuevosSemana = clientes.filter(c => {
        if (!c.created_at) return false;
        const fecha = new Date(c.created_at);
        const inicio = new Date(`${startDateStr}T00:00:00`);
        const fin = new Date(`${endDateStr}T23:59:59`);
        return fecha >= inicio && fecha <= fin;
    });

    const nuevosSemanaTerapia = nuevosSemana.filter(c => c.motivo === "Terapia").length;
    const nuevosSemanaValoracion = nuevosSemana.filter(c => c.motivo === "Valoracion").length;

    const nuevosMes = clientes.filter(c => {
        if (!c.created_at) return false;
        const fecha = new Date(c.created_at);
        return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    });

    const nuevosMesTerapia = nuevosMes.filter(c => c.motivo === "Terapia").length;
    const nuevosMesValoracion = nuevosMes.filter(c => c.motivo === "Valoracion").length;

    return (
        <div className="flex flex-col gap-6 p-4">
            {/* Top metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <Icon name="calendar" className="text-green-500 text-2xl mb-2" />
                    <span className="text-3xl font-bold text-gray-800">{citasHoy.length}</span>
                    <p className="text-sm text-gray-500 mt-1">Citas hoy</p>
                </div>

                <div className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <Icon name="people" className="text-blue-500 text-2xl mb-2" />
                    <span className="text-3xl font-bold text-gray-800">{clientes.length}</span>
                    <p className="text-sm text-gray-500 mt-1">Pacientes registrados</p>
                </div>

                <div className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <Icon name="people" className="text-purple-500 text-2xl mb-2" />
                    <span className="text-3xl font-bold text-gray-800">
                        {clientes.filter(c => c.motivo === 'Terapia').length}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">Pacientes por terapia</p>
                </div>

                <div className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <Icon name="people" className="text-orange-500 text-2xl mb-2" />
                    <span className="text-3xl font-bold text-gray-800">
                        {clientes.filter(c => c.motivo === 'Valoracion').length}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">Pacientes por valoración</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 rounded-xl shadow p-4 w-full">
                    <h3 className="text-yellow-700 font-semibold text-lg mb-4">Resumen semanal</h3>
                    <div className="flex flex-col gap-6 w-full">
                        <DonutCard
                            titulo="Citas agendadas"
                            total={agendadasSemana}
                            data={[
                                { label: "Programadas", value: programadaSemana },
                                { label: "Asistieron", value: asistioSemana },
                                { label: "No asistieron", value: noAsistioSemana },
                            ]}
                        />
                        <DonutCard
                            titulo="Clientes nuevos"
                            total={nuevosSemana.length}
                            data={[
                                { label: "Terapia", value: nuevosSemanaTerapia },
                                { label: "Valoración", value: nuevosSemanaValoracion },
                            ]}
                        />
                    </div>
                </div>

                <div className="bg-purple-50 rounded-xl shadow p-4 w-full">
                    <h3 className="text-purple-700 font-semibold text-lg mb-4">Resumen mensual</h3>
                    <div className="flex flex-col gap-6 w-full">
                        <DonutCard
                            titulo="Citas agendadas"
                            total={agendadasMes}
                            data={[
                                { label: "Programadas", value: programadaMes },
                                { label: "Asistieron", value: asistioMes },
                                { label: "No asistieron", value: noAsistioMes },
                            ]}
                        />
                        <DonutCard
                            titulo="Clientes nuevos"
                            total={nuevosMes.length}
                            data={[
                                { label: "Terapia", value: nuevosMesTerapia },
                                { label: "Valoración", value: nuevosMesValoracion },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <ExportadorMensual citas={citasAnuales} clientes={clientes} />
            </div>
        </div>
    );
};

export default Metricas;
