import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Sidebar from "../components/Sidebar";
import "../styles/calendar.css";

const eventosMock = [
  {
    fecha: new Date(2025, 2, 12), // Marzo (mes 2)
    titulo: "Feria de Ciencias",
    subtitulo: "Exhibición de proyectos científicos",
    horario: "9:00 AM - 3:00 PM",
    lugar: "Gimnasio de la escuela",
    descripcion:
      "Exhibición anual de proyectos científicos realizados por los estudiantes de todos los grados. Los visitantes podrán ver demostraciones en vivo, experimentos interactivos y presentaciones de los jóvenes científicos.",
    participantes: [
      "Todos los grados",
      "Profesores de ciencias",
      "Padres y familiares",
    ],
  },
  {
    fecha: new Date(2025, 3, 8),
    titulo: "Olimpiadas de Matemáticas",
    subtitulo: "Competencia de cálculo escolar",
    horario: "8:00 AM - 1:00 PM",
    lugar: "Sala de informática",
    descripcion: "Competencia entre estudiantes con desafíos matemáticos.",
    participantes: ["Secundaria", "Docentes", "Padres"],
  },
  // ... puedes añadir más
];

const CalendarPage = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  const eventosDelDia = (fecha) =>
    eventosMock.filter(
      (evento) => evento.fecha.toDateString() === fecha.toDateString()
    );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Calendario de actividades" />

      <main className="calendar-main">
        <div className="calendar-title-container">
          <h2 className="calendar-title">Calendario de Actividades</h2>
          <p className="calendar-title-subtitle">
            Aquí puedes ver las actividades programadas para el mes. Haz click en un día para ver los eventos.
          </p>
        </div>
        <div className="calendar-row-container">
          <div className="calendar-column">
            <Calendar
              onClickDay={(value) => setFechaSeleccionada(value)}
              tileContent={({ date }) => {
                const eventos = eventosDelDia(date);
                return eventos.length > 0 ? (
                  <div className="calendar-dot" />
                ) : null;
              }}
            />
          </div>

          {fechaSeleccionada && (
            <div className="calendar-column calendar-detalle">
              {eventosDelDia(fechaSeleccionada).length > 0 ? (
                eventosDelDia(fechaSeleccionada).map((ev, idx) => (
                  <div key={idx} className="calendar-evento">
                    <h3>{ev.titulo}</h3>
                    {ev.subtitulo && (
                      <p className="evento-subtitulo">{ev.subtitulo}</p>
                    )}

                    <div className="evento-info">
                      <p>
                        📅{" "}
                        {fechaSeleccionada.toLocaleDateString("es-EC", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p>⏰ {ev.horario}</p>
                      <p>📍 {ev.lugar}</p>
                    </div>

                    {ev.descripcion && (
                      <>
                        <p className="evento-label">Descripción:</p>
                        <p className="evento-descripcion">{ev.descripcion}</p>
                      </>
                    )}

                    {ev.participantes?.length > 0 && (
                      <>
                        <p className="evento-label">Participantes:</p>
                        <div className="evento-tags">
                          {ev.participantes.map((p, i) => (
                            <span key={i} className="evento-tag">
                              {p}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="calendar-evento-placeholder">
                  <p>No hay actividades registradas para este día.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
