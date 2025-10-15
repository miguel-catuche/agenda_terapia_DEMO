export const useServicioLabels = () => {
  const servicioLabels = {
    valoracion: "Valoración",
    terapia_fisica: "Terapia Física",
    drenaje_linfatico: "Drenaje Linfático",
    piso_pelvico: "Piso Pélvico",
    terapia_respiratoria: "Terapia Respiratoria",
    terapia_vestibular: "Terapia Vestibular",
    acondicionamiento_fisico: "Acondicionamiento Físico",
  };

  const getLabel = (key) => servicioLabels[key] || key;

  return { servicioLabels, getLabel };
};
