import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/feed.css";
import { useNavigate } from "react-router-dom";

const publicacionesIniciales = [
  {
    id: 1,
    autor: "Matheo Chavez",
    avatar: "https://i.pravatar.cc/150?img=10",
    fecha: "2024-03-28",
    imagen: "https://picsum.photos/600?random=101",
    likes: 12,
    liked: false,
    descripcion: "¡Disfrutando del evento de ciencia y tecnología!",
  },
  {
    id: 2,
    autor: "María Velasco",
    avatar: "https://i.pravatar.cc/150?img=5",
    fecha: "2024-03-27",
    imagen: "https://picsum.photos/600?random=102",
    likes: 26,
    liked: false,
    descripcion: "Presentación de nuestro mural ecológico 🌱🎨",
  },
  {
    id: 3,
    autor: "José Pérez",
    avatar: "https://i.pravatar.cc/150?img=12",
    fecha: "2024-03-25",
    imagen: "https://picsum.photos/600?random=103",
    likes: 8,
    liked: false,
    descripcion: "Preparando la presentación para la feria de ciencias.",
  },
];

const FeedPage = () => {
  const [publicaciones, setPublicaciones] = useState(publicacionesIniciales);

  const navigate = useNavigate();

  const toggleLike = (id) => {
    const updated = publicaciones.map((pub) =>
      pub.id === id
        ? {
            ...pub,
            likes: pub.liked ? pub.likes - 1 : pub.likes + 1,
            liked: !pub.liked,
          }
        : pub
    );
    setPublicaciones(updated);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Publicaciones" />

      <main className="feed-main">
        <div className="feed-title-container">
          <h2 className="feed-title">
            <span className="emoji"></span> Publicaciones recientes
          </h2>
          <p className="feed-subtitle">
            Explora lo que comparten otros estudiantes y profesores
          </p>
        </div>

        {publicaciones.map((pub) => (
          <div className="feed-card" key={pub.id}>
            <div className="feed-header">
              <img src={pub.avatar} alt={pub.autor} className="feed-avatar" />
              <div>
                <p
                  className="feed-author clickable"
                  onClick={() =>
                    navigate(
                      `/perfil/${pub.autor
                        .toLowerCase()
                        .replace(/\s+/g, ".")}`
                    )
                  }
                >
                  @{pub.autor}
                </p>
                <p className="feed-date">📅 {pub.fecha}</p>
              </div>
            </div>

            <img src={pub.imagen} alt="publicación" className="feed-image" />

            <div className="feed-actions">
              <button
                className={`like-button-inline ${pub.liked ? "liked" : ""}`}
                onClick={() => toggleLike(pub.id)}
              >
                ❤️ {pub.likes}
              </button>
            </div>
            <p className="feed-description">{pub.descripcion}</p>
          </div>
        ))}
      </main>
    </div>
  );
};

export default FeedPage;
