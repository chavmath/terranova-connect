import React, { useState } from "react";
import "../styles/login.css";
import logo from "../assets/logo_azul.png"; // Asegúrate de tener el logo

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validUsers = [{ email: "admin@terranova.com", password: "admin123" }];
    const user = validUsers.find(
      (u) => u.email === form.email && u.password === form.password
    );
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/dashboard";
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left" />
      <div className="login-right">
        <img src={logo} alt="logo" className="logo" />
        <h1>COLEGIO TERRANOVA</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="************"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit">Iniciar sesión</button>
        </form>
        <button className="microsoft-button">
          <img src="https://img.icons8.com/color/24/000000/microsoft.png" />
          Sign in with Microsoft
        </button>
        <a href="#">¿Olvidaste tu contraseña?</a>
      </div>
    </div>
  );
};

export default LoginPage;
