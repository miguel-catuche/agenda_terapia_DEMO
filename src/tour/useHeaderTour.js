// src/tour/useHeaderTour.js
import { driver } from "driver.js";
import { useNavigate } from "react-router-dom";

export function useHeaderTour() {
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

  const navigate = useNavigate();

  function getSteps(driverObj) {
    const isMobile = window.innerWidth < 768;

    return [
      /* ================= HEADER ================= */
      ...(isMobile
        ? [
            {
              element: "#toggleTour",
              popover: {
                title: "Menú",
                description: "Desde aquí accedes a todas las secciones.",
                side: "bottom",
              },
              onNext: () => {
                document.querySelector("#toggleTour")?.click();
              },
            },
            {
              element: "#clientesTourM",
              popover: {
                title: "Clientes",
                description: "Administra tus pacientes.",
              },
              onNext: () => {
                document.querySelector("#clientesTour")?.click();
              },
            },
          ]
        : [
            {
              element: "#horarioTour",
              popover: {
                title: "Horario",
                description: "Gestiona las citas del día.",
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
          ]),

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
          description:
            "Esta acción permite gestionar, añadir o eliminar los servicios de un cliente.",
        },
      },
      {
        element: "#clientHistoryTour",
        popover: {
          title: "Gestión de historial del cliente",
          description:
            "Esta acción permite visualizar y descargar el historial de citas del cliente y sus servicios.",
        },
      },
      {
        element: "#clientEditTour",
        popover: {
          title: "Gestión/edición de datos del cliente",
          description: "Esta acción permnite editar los datos del cliente.",
        },
      },
      {
        element: "#clientDeleteTour",
        popover: {
          title: "Eliminación del cliente",
          description:
            "Esta acción permite eliminar a un cliente, es irreversible.",
        },
      },
      /* ================= HORARIO ================= */
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
        element: "#addDate",
        popover: {
          title: "Botón para añadir citas únicas.",
          description: "Esta acción permite añadir citas pero de manera única.",
        },
      },
      {
        element: "#takeAssitance",
        popover: {
          title: "Botón para tomar asistencia.",
          description:
            "Esta acción abre un formulario en el día actual, despliega las horas disponibles y permite tomar asistencia en grupos por hora.",
        },
      },
      {
        element: "#scheduleContainer",
        popover: {
          title: "Visualización del horario",
          description:
            "El horario consta de 8 filas y 6 columnas, donde cada una intercede y muestra una cuadrícula que contiene el conteo de citas por día y por hora.",
        },
      },
      {
        element: "#daysTour",
        popover: {
          title: "Dispocisión de días",
          description:
            "Haciendo click en estos elementos permite desplegar una vista con todas las citas de el día seleccionado, con una variación de colores que indican el estado de cada cita: El color gris indica que la cita aún no ha sido valorada. El color verde indica que la cita fue valorada. El color rojo indica que la cita no fue valorada.",
        },
      },
      {
        element: "#hoursTour",
        popover: {
          title: "Dispocisión de horas.",
          description:
            "Estos items indican la intersección de horas disponibles.",
        },
      },
      {
        element: "#cardDatesTour",
        popover: {
          title: "Contador de citas agendadas por día y hora.",
          description:
            "Al hacer click en uno de estos elementos nos permite ver de manera más resumida las citas y clientes que han sido agendados para ese día y hora en específico.",
        },
      },
      {
        element: "#followUpDownload",
        popover: {
          title: "Este apartado permite descargar un pdf que contiene todas las citas.",
          description:
            "Dentro del intervalo de tiempo seleccionado podemos obtener una vista total de las citas agendadas para esa semana o mes.",
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
      steps: [], // inicial vacío
    });

    const steps = getSteps(driverObj);
    driverObj.setSteps(steps);
    driverObj.drive();
  };

  return { startTour };
}
