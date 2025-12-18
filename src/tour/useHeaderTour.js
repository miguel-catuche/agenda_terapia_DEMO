// src/tour/useHeaderTour.js
import { driver } from "driver.js";
import { useNavigate } from "react-router-dom";

export function useHeaderTour() {
  const navigate = useNavigate();

  // Utilitario para esperar elementos en el DOM
  function waitForElement(selector, timeout = 3000) {
    return new Promise((resolve) => {
      const start = Date.now();
      const interval = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(interval);
          resolve(el);
        }
        if (Date.now() - start > timeout) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  }

  function getSteps(driverObj) {
    const isMobile = window.innerWidth < 768;

    const desktopHeaderSteps = [
      {
        element: "#horarioTour",
        popover: {
          title: "Horario",
          description: "Gestiona las citas del día.",
        },
        onHighlighted: () => {
          navigate("/horario");
        },
      },
      {
        element: "#metricasTour",
        popover: {
          title: "Estadísticas",
          description: "Consulta la recopilación de métricas.",
        },
      },
      {
        element: "#clientesTour",
        popover: {
          title: "Clientes",
          description: "Administra los pacientes registrados.",
          side: "bottom",
          align: "start",
        },
        onHighlighted: () => {
          navigate("/clientes");
        },
      },
    ];

    const mobileHeaderSteps = [
      {
        element: "#toggleTour",
        popover: {
          title: "Menú",
          description: "Desde aquí accedes a todas las secciones.",
          side: "bottom",
          // Controlamos el avance para esperar el render del menú
          onNextClick: () => {
            document.querySelector("#toggleTour")?.click();
            // Espera a que aparezca el primer item del menú (horarioTourM)
            waitForElement("#horarioTourM", 2000).then((el) => {
              if (el) driverObj.moveNext();
            });
          },
        },
      },
      {
        element: "#menurBarToggle",
        popover: {
          title: "Menú desplegado",
          description: "Vista de las páginas disponibles.",
          side: "bottom",
        },
      },
      {
        element: "#horarioTourM",
        popover: {
          title: "Horario",
          description: "Gestiona las citas del día.",
        },
        onHighlighted: () => {
          navigate("/horario");
        },
      },
      {
        element: "#metricasTourM",
        popover: {
          title: "Estadísticas",
          description: "Consulta la recopilación de métricas.",
        },
      },
      {
        element: "#clientesTourM",
        popover: {
          title: "Clientes",
          description: "Administra tus pacientes.",
          side: "bottom",
          align: "start",
        },
        onHighlighted: () => {
          navigate("/clientes");
        },
        onDeselected: () => {
          document.querySelector("#closeToggle")?.click();
        },
      },

      {
        popover: {
          title: "Entendiendo Clientes",
          description: "Nos dirigimos a la página de Clientes",
        },
      },
    ];

    return [
      // Header (flujo separado por dispositivo)
      ...(isMobile ? mobileHeaderSteps : desktopHeaderSteps),

      /* ================= CLIENTES ================= */
      {
        element: "#registerBtnTour",
        popover: {
          title: "Nuevo cliente",
          description: "Registra un nuevo paciente.",
        },
      },
      {
        element: "#addBtnTour",
        popover: {
          title: "Agendar Citas",
          description: "Añade citas múltiples para un cliente.",
        },
      },
      {
        element: "#clientListTour",
        popover: {
          title: "Lista de clientes",
          description:
            "Aquí puedes encontrar y gestionar los clientes registrados.",
        },
      },
      {
        element: "#searchClientTour",
        popover: {
          title: "Buscador",
          description:
            "Aquí puedes buscar entre los clientes por nombre o documento.",
        },
      },
      {
        element: "#eachClientTour",
        popover: {
          title: "Cliente",
          description:
            "Cada cliente pertenece a una fila, en la cual encuentras diferentes opciones.",
        },
      },
      {
        element: "#clientIdTour",
        popover: {
          title: "Número de documento del cliente",
          description:
            "Este es el número de documento con el cual fue registrado.",
        },
      },
      {
        element: "#clientPhoneTour",
        popover: {
          title: "Número de teléfono del cliente",
          description:
            "Este es el número de teléfono con el cual fue registrado.",
        },
      },
      {
        element: "#clientReasonTour",
        popover: {
          title: "Motivo de consulta del cliente",
          description:
            "Este es el motivo de consulta/terapia por el cual fue registrado.",
        },
      },
      {
        element: "#clientActionsTour",
        popover: {
          title: "Acciones de gestión de usuario",
          description:
            "Esta sección permite gestionar al cliente de diversas maneras.",
        },
      },
      {
        element: "#clientServiceTour",
        popover: {
          title: "Gestión de servicios del cliente",
        },
      },
      {
        element: "#clientHistoryTour",
        popover: {
          title: "Gestión de historial del cliente",
          description:
            "Visualiza y descarga el historial de citas del cliente y sus servicios.",
        },
      },
      {
        element: "#clientEditTour",
        popover: {
          title: "Edición de datos del cliente",
          description: "Permite editar los datos del cliente.",
        },
      },
      {
        element: "#clientDeleteTour",
        popover: {
          title: "Eliminación del cliente",
          description: "Acción irreversible.",
        },
      },

      /* ================= HORARIO ================= */
      {
        popover: {
          title: "Entendiendo Horario",
          description: "Nos dirigimos a la página de Horario.",
        },
        onHighlighted: () => {
          navigate("/horario");
        },
      },
      {
        element: "#addDate",
        popover: {
          title: "Añadir cita única",
          description: "Añade citas de manera individual.",
        },
      },
      {
        element: "#takeAssitance",
        popover: {
          title: "Tomar asistencia",
          description:
            "Abre el formulario del día actual, despliega horas disponibles y permite tomar asistencia por grupos de hora.",
        },
      },
      {
        element: "#scheduleContainer",
        popover: {
          title: "Visualización del horario",
          description:
            "Cuadrícula de 8 filas y 6 columnas con conteo de citas por día y hora.",
        },
      },
      {
        element: "#daysTour",
        popover: {
          title: "Disposición de días",
          description:
            "Vista con todas las citas del día seleccionado y colores por estado.",
        },
      },
      {
        element: "#hoursTour",
        popover: {
          title: "Disposición de horas",
          description: "Intersecciones de horas disponibles.",
        },
      },
      {
        element: "#cardDatesTour",
        popover: {
          title: "Citas por día y hora",
          description:
            "Vista resumida de citas y clientes agendados para una intersección específica.",
        },
      },
      {
        element: "#followUpDownload",
        popover: {
          title: "Descargar PDF de citas",
          description:
            "Vista total de citas en el intervalo seleccionado (semana o mes).",
        },
      },
    ];
  }

  const startTour = () => {
    const driverObj = driver({
      animate: true,
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.6,
      nextBtnText: "Siguiente",
      prevBtnText: "Atrás",
      doneBtnText: "Finalizar",
      steps: [],
    });

    const steps = getSteps(driverObj);
    driverObj.setSteps(steps);
    driverObj.drive();
  };

  return { startTour };
}
