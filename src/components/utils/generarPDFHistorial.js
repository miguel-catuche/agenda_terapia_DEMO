import jsPDF from "jspdf";
import "jspdf-autotable"; // solo importa, no lo vincules manualmente

export const generarPDFHistorial = (cliente, citas) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const fechaActual = new Date().toLocaleDateString("es-CO");
  const horaActual = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Encabezado institucional
  const x = 40;
  const y = 40;
  const anchoTotal = 520;
  const altoFila = 80;
  const anchoLogo = 90;
  const anchoExpedido = 90;
  const anchoCentro = anchoTotal - anchoLogo - anchoExpedido;

  // Cuadro principal
  doc.setDrawColor(0); // negro puro
  doc.setLineWidth(0.5); // grosor institucional
  doc.rect(x, y, anchoTotal, altoFila, "D"); // D = solo borde

  // Divisiones verticales
  doc.line(x + anchoLogo, y, x + anchoLogo, y + altoFila);
  doc.line(
    x + anchoLogo + anchoCentro,
    y,
    x + anchoLogo + anchoCentro,
    y + altoFila
  );

  // Logo
  const logoBase64 =
    "https://cdn.myanimelist.net/images/characters/7/582489.jpg";
  doc.addImage(logoBase64, "JPEG", x + 15, y + 10, 60, 60);

  // Centro: nombre empresa y título
  const centroX = x + anchoLogo + anchoCentro / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("NOMBRE DE EMPRESA", centroX, y + 25, { align: "center" });

  // Línea horizontal divisoria
  doc.setDrawColor(0);
  doc.setFillColor(0);
  doc.rect(x + anchoLogo, y + 35, anchoCentro, 0.3, "F"); // línea horizontal simulada

  doc.setFontSize(10);
  doc.text("FORMATO REGISTRO DE ASISTENCIA", centroX, y + 55, {
    align: "center",
  });

  // Expedido
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const expX = x + anchoLogo + anchoCentro + 10;
  doc.text("Expedido:", expX, y + 20);
  doc.text(`Fecha: ${fechaActual}`, expX, y + 35);
  doc.text(`Hora: ${horaActual}`, expX, y + 50);

  // Sección 1: Registro de Asistencia
  const seccion1Y = 150;
  const altoSeccion = 20;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  // Dibujar rectángulo con borde y fondo
  doc.setDrawColor(0); // borde negro
  doc.setFillColor(255, 243, 168); // fondo amarillo institucional
  doc.rect(40, seccion1Y, 520, altoSeccion, "FD"); // F = fill, D = draw (borde + fondo)

  // Centrar el texto dentro del rectángulo
  doc.text("1. REGISTRO DE ASISTENCIA", 300, seccion1Y + 14, {
    align: "center",
  });

  // Tabla pegada al título, sin espacio
  doc.autoTable({
    startY: seccion1Y + altoSeccion,
    theme: "grid",
    head: null,
    body: [
      [`EMPRESA: Nombre empresa`, `SERVICIO: TERAPIA Y REHABILITACIÓN FÍSICA`],
      [
        `PACIENTE: ${cliente?.nombre || "—"}`,
        `Documento de identidad: ${cliente?.id || "—"}`,
      ],
    ],
    styles: {
      fontSize: 10,
      halign: "left",
      cellPadding: 6,
      lineWidth: 0.5, // ← bordes más definidos
      lineColor: [0, 0, 0], // ← negro puro
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 260 },
      1: { cellWidth: 260 },
    },
    tableWidth: 520,
  });

  // Línea inferior del título
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(40, seccion1Y + altoSeccion, 560, seccion1Y + altoSeccion);

  // Sección 2: Seguimiento
  const seguimientoY = doc.lastAutoTable.finalY + 30;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  // Título con fondo y borde institucional
  doc.setDrawColor(0); // borde negro
  doc.setFillColor(255, 243, 168); // fondo amarillo
  doc.rect(40, seguimientoY, 520, 20, "FD"); // F = fill, D = draw
  doc.text("2. SEGUIMIENTO", 300, seguimientoY + 14, { align: "center" });

  // Preparar filas
  const estadoLabels = {
    programada: "Programada",
    completada: "Completada",
    cancelada: "Cancelada",
    "no-se-presento": "No Asistió",
  };

  const seguimientoRows = citas.map((cita) => {
    const [hora, minutos] = cita.hora.split(":");
    const periodo = parseInt(hora, 10) >= 12 ? "p.m" : "a.m";
    return [
      cita.fecha,
      `${hora.padStart(2, "0")}:${minutos} ${periodo}`,
      estadoLabels[cita.estado] || "—",
    ];
  });

  // Dibujar tabla institucional con bordes definidos
  doc.autoTable({
    startY: seguimientoY + 20,
    head: [["FECHA", "HORA", "ESTADO"]],
    body: seguimientoRows,
    theme: "grid",
    showHead: "everyPage", // 👈 esto mantiene el encabezado en todas las páginas
    styles: {
      fontSize: 10,
      halign: "center",
      overflow: "linebreak",
      cellPadding: 4,
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [245, 245, 255],
      textColor: 0,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 173 },
      1: { cellWidth: 173 },
      2: { cellWidth: 174 },
    },
    tableWidth: 520,
    didDrawPage: (data) => {
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

      if (currentPage > 1) {
        const y = data.settings.margin.top - 20; // 👈 desplaza el título hacia arriba
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setDrawColor(0);
        doc.setFillColor(255, 243, 168);
        doc.rect(40, y, 520, 20, "FD");
        doc.text("2. SEGUIMIENTO", 300, y + 14, { align: "center" });
      }
    },
  });

  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Firma institucional
    // 👇 Firma solo en la última página
    doc.setPage(doc.internal.getNumberOfPages()); // ir a la última página
    const firmaY = doc.lastAutoTable.finalY + 30;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Firma del responsable: ______________________", 40, firmaY);

    // Número de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(85);
      doc.text(`Página ${i}`, 520, 770, { align: "right" });
    }
  }

  const nombreArchivo = `registro_${
    cliente?.nombre?.replace(/\s+/g, "_") || "paciente"
  }.pdf`;
  doc.save(nombreArchivo);
};
