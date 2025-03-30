import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/perfil.css";

const publicacionesIniciales = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/600?random=${i + 30}`,
  fecha: `2024-0${(i % 9) + 1}-0${(i % 27) + 1}`,
  likes: Math.floor(Math.random() * 100),
  liked: false,
  descripcion: `Actividad destacada #${i + 1} realizada por María Velasco`
}));

const PublicProfilePage = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(280);
  const [selectedPost, setSelectedPost] = useState(null);
  const [publicaciones, setPublicaciones] = useState(publicacionesIniciales);

  const user = {
    nombre: "María Velasco",
    rol: "ESTUDIANTE",
    seguidos: 132,
    publicaciones: publicaciones.length,
    avatar: "https://i.pravatar.cc/150?img=5",
    email: "maria.velasco@terranova.edu.ec",
  };

  const toggleFollow = () => {
    setIsFollowing((prev) => {
      const next = !prev;
      setFollowersCount((count) => count + (next ? 1 : -1));
      return next;
    });
  };

  const handleLike = () => {
    if (!selectedPost || selectedPost.liked) return;

    const updatedPosts = publicaciones.map((p) =>
      p.id === selectedPost.id ? { ...p, likes: p.likes + 1, liked: true } : p
    );

    setPublicaciones(updatedPosts);
    setSelectedPost({
      ...selectedPost,
      likes: selectedPost.likes + 1,
      liked: true,
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar active={null} />
      <main className="perfil-main">
        <div className="perfil-ig-header">
          <img src={user.avatar} alt="Avatar" className="perfil-ig-avatar" />

          <div className="perfil-ig-info">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <h2 className="perfil-ig-nombre">@{user.nombre}</h2>
              <button
                className={`follow-button ${isFollowing ? "following" : ""}`}
                onClick={toggleFollow}
              >
                {isFollowing ? "Siguiendo" : "Seguir"}
              </button>
            </div>
            <div className="perfil-ig-contadores">
              <div>
                <strong>{user.publicaciones}</strong>
                <span> publicaciones</span>
              </div>
              <div>
                <strong>{followersCount}</strong>
                <span> seguidores</span>
              </div>
              <div>
                <strong>{user.seguidos}</strong>
                <span> seguidos</span>
              </div>
            </div>
            <p className="perfil-ig-rol">{user.rol} - {user.email}</p>
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

        {selectedPost && (
          <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setSelectedPost(null)}
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
      </main>
    </div>
  );
};

export default PublicProfilePage;
