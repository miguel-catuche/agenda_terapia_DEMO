export const estadoLabels = {
  programada: "Programada",
  asistio: "Asistió",
  "no-asistio": "No Asistió",
};

export const motivoLabels = {
  Terapia: "Terapia",
  Valoracion: "Valoración",
};

export const getEstadoColor = (estado) => {
  switch (estado) {
    case "no-asistio":
      return "bg-red-400";
    case "asistio":
      return "bg-green-400";
    case "programada":
      return "bg-blue-400";
    default:
      return "bg-gray-200";
  }
};

export const getMotivoColor = (motivo) => {
  switch (motivo) {
    case "Terapia":
      return "bg-amber-300";
    case "Valoracion":
      return "bg-fuchsia-300";
    default:
      return "bg-gray-200";
  }
};

export const getMotivoCitas = (motivo) => {
  switch (motivo) {
    case "Terapia":
      return 'bg-amber-100 text-amber-800';
    case "Valoracion":
      return 'bg-sky-100 text-sky-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getEstadoClasses = (estado) => {
  switch (estado) {
    case "no-asistio":
      return 'bg-red-200 border border-red-300 text-red-900 font-semibold';
    case "asistio":
      return 'bg-green-200 border border-green-300 text-green-900 font-semibold';
    case "programada":
      return 'bg-blue-200 border border-blue-300 text-blue-800 font-semibold';
    default:
      return "bg-gray-200";
  }
};