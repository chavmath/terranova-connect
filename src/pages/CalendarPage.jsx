import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Sidebar from "../components/Sidebar";
import "../styles/calendar.css";
import Cookies from "js-cookie";

const CalendarPage = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const token = Cookies.get("token");
        const response = await fetch("https://kong-7df170cea7usbksss.kongcloud.dev/actividades", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();

        const eventosFormateados = data.map((actividad) => {
          const fechaInicioUTC = new Date(actividad.fechaInicio);
          const fechaFinUTC = new Date(actividad.fechaFin);
          const fechaInicioLocal = new Date(
            fechaInicioUTC.getUTCFullYear(),
            fechaInicioUTC.getUTCMonth(),
            fechaInicioUTC.getUTCDate()
          );
          const fechaFinLocal = new Date(
            fechaFinUTC.getUTCFullYear(),
            fechaFinUTC.getUTCMonth(),
            fechaFinUTC.getUTCDate()
          );

          return {
            fecha: fechaInicioLocal, // para el calendario
            fechaFin: fechaFinLocal,
            titulo: actividad.titulo,
            subtitulo: actividad.descripcion,
            horario: "Por definir",
            lugar: "Por definir",
            descripcion: actividad.descripcion,
            participantes: [],
          };
        });

        setEventos(eventosFormateados);
      } catch (error) {
        console.error("Error al obtener actividades:", error);
      }
    };

    fetchActividades();
  }, []);

  const eventosDelDia = (fecha) =>
    eventos.filter(
      (evento) => evento.fecha.toDateString() === fecha.toDateString()
    );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Calendario de actividades" />

      <main className="calendar-main">
        <div className="calendar-title-container">
          <h2 className="calendar-title">Calendario de Actividades</h2>
          <p className="calendar-title-subtitle">
            Aquí puedes ver las actividades programadas para el mes. Haz click
            en un día para ver los eventos.
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

                    <div className="evento-info">
                      <p>
                        📅{" "}
                        {ev.fecha.toLocaleDateString("es-EC", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>

                      {ev.fechaFin &&
                      ev.fecha.getTime() !== ev.fechaFin.getTime() ? (
                        <p>
                          ⏰ Del {ev.fecha.getDate()} de{" "}
                          {ev.fecha.toLocaleString("es-EC", { month: "long" })}{" "}
                          al {ev.fechaFin.getDate()} de{" "}
                          {ev.fechaFin.toLocaleString("es-EC", {
                            month: "long",
                          })}{" "}
                          de {ev.fechaFin.getFullYear()}
                        </p>
                      ) : null}

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
