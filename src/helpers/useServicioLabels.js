// src/hooks/useServicioLabels.js
export const useServicioLabels = () => {
  const servicioLabels = {
    valoracion: "Valoración",
    terapia_fisica: "Terapia Física",
    drenaje_linfatico: "Drenaje Linfático",
    piso_pelvico: "Piso Pélvico",
    terapia_respiratoria: "Terapia Respiratoria",
  };

  const getLabel = (key) => servicioLabels[key] || key;

  return { servicioLabels, getLabel };
};
