// src/__tests__/InsigniasPage.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InsigniasPage from "../src/pages/InsigniasPage";
import "whatwg-fetch"; // habilita fetch en el entorno de Jest
import Cookies from "js-cookie";

const fakeToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + "eyJpZCI6IjEyMyJ9." + "signature";

// Mock del componente Sidebar y canvas-confetti para evitar errores
jest.mock("../src/components/Sidebar", () => () => <div>Mock Sidebar</div>);
jest.mock("canvas-confetti", () => jest.fn());

describe("InsigniasPage", () => {
  beforeEach(() => {
    Cookies.set("token", fakeToken); // ← aquí está el fix

    global.fetch = jest
      .fn()
      // 1. /insignias
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve([
              {
                id_insignia: 1,
                nombre: "Insignia 1",
                puntosrequeridos: 100,
                descripcion: "Test insignia",
                imagenes: [{ url: "img1.png" }],
              },
            ]),
        })
      )
      // 2. /reclamadas
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve([]) })
      )
      // 3. /usuario
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              nombre: "Juan",
              apellido: "Pérez",
              foto_perfil: [],
              puntosAcumulados: 200,
            }),
        })
      )
      // 4. POST /reclamar
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      )
      // 5. Re-fetch /insignias tras reclamar
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve([
              {
                id_insignia: 1,
                nombre: "Insignia 1",
                puntosrequeridos: 100,
                descripcion: "Test insignia",
                imagenes: [{ url: "img1.png" }],
              },
            ]),
        })
      )
      // 6. Re-fetch /reclamadas
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve([{ id_insignia: 1 }]) })
      )
      // 7. Re-fetch /usuario
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              nombre: "Juan",
              apellido: "Pérez",
              foto_perfil: [],
              puntosAcumulados: 100,
            }),
        })
      );
  });

  it("renderiza el nombre del usuario", async () => {
    render(<InsigniasPage />);
    const nombreElement = await screen.findByRole("heading", {
      level: 2,
      name: "",
    });
    expect(nombreElement).toBeInTheDocument();
  });

  it("muestra las insignias disponibles", async () => {
    render(<InsigniasPage />);
    const insignia = await screen.findByText("Insignia 1");
    expect(insignia).toBeInTheDocument();
  });

  it("muestra animación de felicitaciones al reclamar insignia", async () => {
    render(<InsigniasPage />);
    const boton = await screen.findByRole("button", { name: /Reclamar/i });
    fireEvent.click(boton);

    const confirmar = await screen.findByRole("button", {
      name: /sí, reclamar/i,
    });
    fireEvent.click(confirmar);

    await waitFor(() =>
      expect(screen.getByText(/¡Felicidades!/i)).toBeInTheDocument()
    );
  });
});
