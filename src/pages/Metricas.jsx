import React from "react";
import DonutCard from "@/components/DonutCard";
import Icon from "@/components/Icons";
import { useClientes } from "@/hooks/useClientes";
import { useCitas } from "@/hooks/useCitas";
import ExportadorMensual from "@/components/ExportadorMensual";
const Metricas = () => {
    const { clientes } = useClientes();
    const { citas } = useCitas();

    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
    const citasHoy = citas.filter(cita => cita.fecha === hoyStr);

    const getSemanaRange = (baseDate) => {
        const base = new Date(baseDate);
        const dow = base.getDay(); // 0 = domingo
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

    const { startDateStr, endDateStr } = getSemanaRange(hoy);

    const citasSemana = citas.filter(cita =>
        typeof cita.fecha === "string" &&
        cita.fecha >= startDateStr &&
        cita.fecha <= endDateStr
    );

    const agendadasSemana = citasSemana.length;
    const programadaSemana = citasSemana.filter(c => c.estado === "programada").length;
    const completadasSemana = citasSemana.filter(c => c.estado === "completada").length;
    const canceladasSemana = citasSemana.filter(c => c.estado === "cancelada").length;
    const noPresentadoSemana = citasSemana.filter(c => c.estado === "no-se-presento").length;


    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    const citasMes = citas.filter(cita => {
        if (typeof cita.fecha !== "string") return false;
        const [y, m] = cita.fecha.split("-").map(Number);
        return y === añoActual && m - 1 === mesActual;
    });

    const agendadasMes = citasMes.length;
    const programadaMes = citasMes.filter(c => c.estado === "programada").length;
    const completadasMes = citasMes.filter(c => c.estado === "completada").length;
    const canceladasMes = citasMes.filter(c => c.estado === "cancelada").length;
    const noPresentadoMes = citasMes.filter(c => c.estado === "no-se-presento").length;

    // Totales semanales
    const nuevosSemana = clientes.filter(c => {
        if (!c.created_at) return false;
        const fecha = new Date(c.created_at);
        const inicio = new Date(`${startDateStr}T00:00:00`);
        const fin = new Date(`${endDateStr}T23:59:59`);
        return fecha >= inicio && fecha <= fin;
    }).length;


    const nuevosSemanaTerapia = clientes.filter(c => {
        if (!c.created_at) return false;
        const fecha = new Date(c.created_at);
        const inicio = new Date(`${startDateStr}T00:00:00`);
        const fin = new Date(`${endDateStr}T23:59:59`);
        return fecha >= inicio && fecha <= fin;
    }).length;

    const nuevosSemanaValoracion = clientes.filter(c => {
        if (!c.created_at) return false;
        const fecha = new Date(c.created_at);
        const inicio = new Date(`${startDateStr}T00:00:00`);
        const fin = new Date(`${endDateStr}T23:59:59`);
        return fecha >= inicio && fecha <= fin;
    }).length;

    // Totales mensuales
    const nuevosMes = clientes.filter(c => {
        if (!c.created_at) return false;
        const fecha = new Date(c.created_at);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    }).length;

    const nuevosMesTerapia = clientes.filter(c => {
        if (!c.created_at) return false;
        const fecha = new Date(c.created_at);
        return (
            fecha.getMonth() === mesActual &&
            fecha.getFullYear() === añoActual &&
            c.motivo === "Terapia"
        );
    }).length;

    const nuevosMesValoracion = clientes.filter(c => {
        if (!c.created_at) return false;
        const fecha = new Date(c.created_at);
        return (
            fecha.getMonth() === mesActual &&
            fecha.getFullYear() === añoActual &&
            c.motivo === "Valoracion"
        );
    }).length;


    return (
        <div className="flex flex-col gap-6 p-4">
            {/* Top metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Citas hoy */}
                <div className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <Icon name="calendar" className="text-green-500 text-2xl mb-2" />
                    <span className="text-3xl font-bold text-gray-800">{citasHoy.length}</span>
                    <p className="text-sm text-gray-500 mt-1">Citas hoy</p>
                </div>

                {/* Pacientes registrados */}
                <div className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <Icon name="people" className="text-blue-500 text-2xl mb-2" />
                    <span className="text-3xl font-bold text-gray-800">{clientes.length}</span>
                    <p className="text-sm text-gray-500 mt-1">Pacientes registrados</p>
                </div>

                {/* Terapia */}
                <div className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <Icon name="people" className="text-purple-500 text-2xl mb-2" />
                    <span className="text-3xl font-bold text-gray-800">
                        {clientes.filter(c => c.motivo === 'Terapia').length}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">Pacientes por terapia</p>
                </div>

                {/* Valoración */}
                <div className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <Icon name="people" className="text-orange-500 text-2xl mb-2" />
                    <span className="text-3xl font-bold text-gray-800">
                        {clientes.filter(c => c.motivo === 'Valoracion').length}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">Pacientes por valoración</p>
                </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resumen semanal */}
                <div className="bg-yellow-50 rounded-xl shadow p-4 w-full">
                    <h3 className="text-yellow-700 font-semibold text-lg mb-4">Resumen semanal</h3>
                    <div className="flex flex-col gap-6 w-full">
                        <DonutCard
                            titulo="Citas agendadas"
                            total={agendadasSemana}
                            data={[
                                { label: "Programadas", value: programadaSemana },
                                { label: "Completadas", value: completadasSemana },
                                { label: "Canceladas", value: canceladasSemana },
                                { label: "No asistieron", value: noPresentadoSemana },
                            ]}
                        />
                        <DonutCard
                            titulo="Clientes nuevos"
                            total={nuevosSemana}
                            data={[
                                { label: "Terapia", value: nuevosSemanaTerapia },
                                { label: "Valoración", value: nuevosSemanaValoracion },
                            ]}
                        />
                    </div>
                </div>

                {/* Resumen mensual */}
                <div className="bg-purple-50 rounded-xl shadow p-4 w-full">
                    <h3 className="text-purple-700 font-semibold text-lg mb-4">Resumen mensual</h3>
                    <div className="flex flex-col gap-6 w-full">
                        <DonutCard
                            titulo="Citas agendadas"
                            total={agendadasMes}
                            data={[
                                { label: "Programadas", value: programadaMes },
                                { label: "Completadas", value: completadasMes },
                                { label: "Canceladas", value: canceladasMes },
                                { label: "No asistieron", value: noPresentadoMes },
                            ]}
                        />
                        <DonutCard
                            titulo="Clientes nuevos"
                            total={nuevosMes}
                            data={[
                                { label: "Terapia", value: nuevosMesTerapia },
                                { label: "Valoración", value: nuevosMesValoracion },
                            ]}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <ExportadorMensual citas={citas} clientes={clientes} />
            </div>
        </div>

    );
};

export default Metricas;
