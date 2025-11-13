import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generarPDFCitas = (citas = [], modo = "semana", opciones = {}) => {
  const { titulo = "SEGUIMIENTO DE CITAS", nombreArchivo = "seguimiento.pdf" } =
    opciones;

  const estadoLabels = {
    programada: "Programada",
    asistio: "Asistió",
    "no-asistio": "No Asistió",
  };

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

  const x = 40;
  const y = 40;
  const anchoTotal = 520;
  const altoFila = 80;
  const anchoLogo = 90;
  const anchoExpedido = 90;
  const anchoCentro = anchoTotal - anchoLogo - anchoExpedido;

  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(x, y, anchoTotal, altoFila, "D");

  doc.line(x + anchoLogo, y, x + anchoLogo, y + altoFila);
  doc.line(
    x + anchoLogo + anchoCentro,
    y,
    x + anchoLogo + anchoCentro,
    y + altoFila
  );

  // Logo
  const logoBase64 = "https://i.imgur.com/NQERpK7.png";
  doc.addImage(logoBase64, "JPEG", x + 15, y + 10, 60, 60);

  const centroX = x + anchoLogo + anchoCentro / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text("CENTRO TERAPÉUTICO INTEGRAL", centroX, y + 18, { align: "center" });

  doc.text("MARÍA DEL PILAR TAMAYO GARCÍA", centroX, y + 32, {
    align: "center",
  });

  // Línea horizontal divisoria
  doc.setDrawColor(0);
  doc.setFillColor("0");
  doc.rect(x + anchoLogo, y + 40, anchoCentro, 0.3, "F"); // línea horizontal simulada

  doc.setFontSize(11);
  doc.text("FORMATO REGISTRO DE ASISTENCIA", centroX, y + 62, {
    align: "center",
  });

  // Expedido
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const expX = x + anchoLogo + anchoCentro + 10;
  doc.text("Expedido:", expX, y + 20);
  doc.text(`Fecha: ${fechaActual}`, expX, y + 35);
  doc.text(`Hora: ${horaActual}`, expX, y + 50);

  //Tabla

  const seguimientoY = y + altoFila + 30;

  const seguimientoRows = citas.map((cita) => {
    const cliente = cita.clientes_servicio?.cliente;
    const nombre = cliente?.nombre || cita.clientes_servicio?.cliente_nombre || "—";
    const documento = cliente?.id || cita.clientes_servicio?.cliente_id || "—";

    const [hora, minutos] = cita.hora.split(":");
    const periodo = parseInt(hora, 10) >= 12 ? "p.m" : "a.m";

    return [
      documento,
      nombre,
      cita.fecha,
      `${hora.padStart(2, "0")}:${minutos} ${periodo}`,
      estadoLabels[cita.estado] || "—",
    ];
  });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setDrawColor(0);
  doc.setFillColor(255, 243, 168);
  doc.rect(40, seguimientoY, 520, 20, "FD");
  doc.text(`${titulo}`, 300, seguimientoY + 14, {
    align: "center",
  });

  autoTable(doc, {
    startY: seguimientoY + 20,
    head: [["DOCUMENTO", "NOMBRE", "FECHA", "HORA", "ESTADO"]],
    body: seguimientoRows,
    theme: "grid",
    showHead: "everyPage",
    // margin: { top: 100 }, ← quítalo

    styles: {
      fontSize: 10,
      halign: "center",
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
      0: { cellWidth: 100 },
      1: { cellWidth: 120 },
      2: { cellWidth: 100 },
      3: { cellWidth: 100 },
      4: { cellWidth: 100 },
    },
    tableWidth: 520,

    didDrawPage: (data) => {
      const pageNumber = doc.getCurrentPageInfo().pageNumber;
      if (pageNumber > 1) {
        const offsetY = 40; // posición fija para encabezado visual
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setDrawColor(0);
        doc.setFillColor(255, 243, 168);
        doc.rect(40, offsetY, 520, 20, "FD");
        doc.text(`${titulo}`, 300, offsetY + 14, { align: "center" });
      }
    },
  });

  //Paginación
  // const firmaY = doc.lastAutoTable.finalY + 30;
  // doc.setFontSize(10);
  // doc.setFont("helvetica", "normal");
  // doc.text("Firma del responsable: ______________________", 40, firmaY);

  const pageCount = doc.getNumberOfPages(); // ← corregido
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(85);
    doc.text(`Página ${i}`, 520, 770, { align: "right" });
  }

  doc.save(nombreArchivo);
};
