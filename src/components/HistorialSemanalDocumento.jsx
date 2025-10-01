import React from "react";

const HistorialSemanalDocumento = ({ citas }) => {
  const fechaActual = new Date().toLocaleDateString("es-CO");
  const horaActual = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const estadoLabels = {
    programada: "Programada",
    completada: "Completada",
    cancelada: "Cancelada",
    "no-se-presento": "No Asistió",
  };

  const citasPorPagina = 13;
  const bloquesDeCitas = [];

  for (let i = 0; i < citas.length; i += citasPorPagina) {
    bloquesDeCitas.push(citas.slice(i, i + citasPorPagina));
  }

  return (
    <>
      {bloquesDeCitas.map((bloque, pageIndex) => (
        <div
          key={pageIndex}
          className={`bg-white text-black max-w-[800px] min-h-[930px] mx-auto p-8 border border-black text-sm leading-tight print-page flex flex-col justify-start ${pageIndex !== bloquesDeCitas.length - 1 ? "mb-8" : ""
            }`}
        >
          {/* Encabezado institucional */}
          {pageIndex === 0 && (
            <div className="border border-black mb-6">
              <div className="flex items-stretch">
                <div className="border-r border-black flex items-center justify-center overflow-hidden w-[120px] h-[120px]">
                  {/* <img
                    src="/ruta-del-logo.png"
                    alt="Logo institucional"
                    className="object-contain w-full h-full"
                  /> */}
                </div>
                <div className="flex-1 py-2 text-center flex flex-col items-center justify-center">
                  <h1 className="text-base font-bold uppercase">
                    NOMBRE DE EMPRESA
                  </h1>
                  <div className="w-full border-b border-black my-2" />
                  <p className="uppercase">SEGUIMIENTO SEMANAL DE CITAS</p>
                </div>
                <div className="border-l border-black px-3 py-2 text-sm text-right">
                  <p>Expedido:</p>
                  <p>Fecha: {fechaActual}</p>
                  <p>Hora: {horaActual}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de seguimiento semanal */}
          <div>
            <div className="bg-[#fff3a8] text-black font-bold uppercase text-center px-3 py-1 border border-black h-10">
              1. Seguimiento semanal
            </div>

            <div className="grid grid-cols-5 text-sm font-semibold border-x border-black">
              <div className="flex justify-center items-center border-r border-black h-10">DOCUMENTO</div>
              <div className="flex justify-center items-center border-r border-black h-10">NOMBRE</div>
              <div className="flex justify-center items-center border-r border-black h-10">FECHA</div>
              <div className="flex justify-center items-center border-r border-black h-10">HORA</div>
              <div className="flex justify-center items-center h-10">ESTADO</div>
            </div>

            {bloque.map((cita, i) => (
              <div
                key={i}
                className={`grid grid-cols-5 text-sm border-x border-black ${i === bloque.length - 1 ? "border-b border-black" : ""
                  }`}
              >
                <div className="flex justify-center items-center border-r border-black border-t border-black h-10">
                  {cita.cliente?.id || "—"}
                </div>
                <div className="flex justify-center items-center border-r border-black border-t border-black h-10">
                  {cita.cliente?.nombre || "—"}
                </div>
                <div className="flex justify-center items-center border-r border-black border-t border-black h-10">
                  {cita.fecha}
                </div>
                <div className="flex justify-center items-center border-r border-black border-t border-black h-10">
                  {`${cita.hora} ${parseInt(cita.hora.split(":")[0], 10) >= 12 ? "p.m" : "a.m"}`}
                </div>
                <div className="flex justify-center items-center border-t border-black h-10">
                  {estadoLabels[cita.estado]}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default HistorialSemanalDocumento;