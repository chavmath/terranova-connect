import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/perfil.css";

const generatePublicaciones = () =>
  Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    url: `https://picsum.photos/600?random=${i + 1}`,
    fecha: `2024-0${(i % 9) + 1}-0${(i % 27) + 1}`,
    likes: Math.floor(Math.random() * 100),
    liked: false,
    descripcion: `Esta es una descripción de la publicación número ${i + 1}`,
  }));

const PerfilPage = () => {
  const [publicaciones, setPublicaciones] = useState(generatePublicaciones());
  const [selectedPost, setSelectedPost] = useState(null);

  const user = {
    nombre: "Matheo Chavez",
    email: "matheo@terranova.edu.ec",
    rol: "ESTUDIANTE",
    seguidores: 120,
    seguidos: 85,
    publicaciones: publicaciones.length,
  };

  const avatar = "https://i.pravatar.cc/150?img=11";

  const handleLike = () => {
    if (!selectedPost || selectedPost.liked) return;

    const updated = publicaciones.map((post) =>
      post.id === selectedPost.id
        ? { ...post, likes: post.likes + 1, liked: true }
        : post
    );

    setPublicaciones(updated);
    setSelectedPost({
      ...selectedPost,
      likes: selectedPost.likes + 1,
      liked: true,
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active="Mi perfil" />

      <main className="perfil-main">
        <div className="perfil-ig-header">
          <img src={avatar} alt="Avatar" className="perfil-ig-avatar" />

          <div className="perfil-ig-info">
            <h2 className="perfil-ig-nombre">@{user.nombre}</h2>

            <div className="perfil-ig-contadores">
              <div>
                <strong>{user.publicaciones}</strong>
                <span> publicaciones</span>
              </div>
              <div>
                <strong>{user.seguidores}</strong>
                <span> seguidores</span>
              </div>
              <div>
                <strong>{user.seguidos}</strong>
                <span> seguidos</span>
              </div>
            </div>

            <p className="perfil-ig-rol">
              {user.rol} - {user.email}
            </p>
          </div>
        </div>

        <div className="perfil-galeria">
          {publicaciones.map((post) => (
            <div
              key={post.id}
              className="perfil-post"
              onClick={() => setSelectedPost(post)}
            >
              <img src={post.url} alt={`post-${post.id}`} />
            </div>
          ))}
        </div>
      </main>
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedPost(null)}
              aria-label="Cerrar publicación"
            >
              ✖
            </button>

            <img
              src={selectedPost.url}
              alt="post"
              className="modal-image-full"
            />

            <div className="modal-meta">
              <div className="modal-meta-row">
                <span className="modal-user">@{user.nombre}</span>
                <button
                  className={`like-button-inline ${
                    selectedPost.liked ? "liked" : ""
                  }`}
                  onClick={handleLike}
                >
                  ❤️ {selectedPost.likes} Me gusta
                </button>
                <span className="modal-fecha">📅 {selectedPost.fecha}</span>
                <p className="modal-descripcion">{selectedPost.descripcion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilPage;
