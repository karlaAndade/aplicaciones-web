// Login.jsx
// Pantalla de inicio de sesión (pantalla 3 del diseño).
// Props:
//   - onLogin(usuario): App.jsx la usa para guardar el usuario logueado.
//   - irARegistro(): cambia a la pantalla de Registro.
//   - irAInicio(): regresa a la página pública (Landing).

import { useState } from "react";
import { getUsuarios } from "../data/storage";
import { esCorreoValido, esTextoNoVacio } from "../utils/validadores";

export default function Login({ onLogin, irARegistro, irAInicio, avisoInicial }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    // 1) Validaciones básicas del formulario
    if (!esTextoNoVacio(correo) || !esCorreoValido(correo)) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (!esTextoNoVacio(password)) {
      setError("Ingresa tu contraseña.");
      return;
    }

    // 2) Buscamos el usuario en localStorage
    const usuarios = getUsuarios();
    const usuario = usuarios.find(
      (u) => u.correo.toLowerCase() === correo.trim().toLowerCase()
    );

    if (!usuario) {
      setError("No existe una cuenta con ese correo.");
      return;
    }
    // Los graduados y empresas deben ser aprobados por el administrador
    // antes de poder ingresar (el admin siempre está aprobado por defecto).
    if (usuario.aprobado === false) {
      setError(
        "Tu cuenta está pendiente de aprobación por el administrador."
      );
      return;
    }
    if (!usuario.activo) {
      setError("Esta cuenta está desactivada. Contacta al administrador.");
      return;
    }
    if (usuario.password !== password) {
      setError("Contraseña incorrecta.");
      return;
    }

    onLogin(usuario);
  }

  return (
    <div className="pantalla-auth">
      <div className="fondo-decorativo" />
      <div className="tarjeta-auth tarjeta-login">
        <button type="button" className="enlace-volver" onClick={irAInicio}>
          ← Volver al inicio
        </button>

        <div className="cabecera-login">
          <div className="icono-candado"></div>
          <h2>Acceder al sistema</h2>
          <p className="subtitulo">Plataforma Empleo ULEAM</p>
        </div>

        <form onSubmit={manejarEnvio} noValidate>
          {avisoInicial && <p className="mensaje-exito">{avisoInicial}</p>}

          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="usuario@uleam.edu.ec"
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && <p className="mensaje-error">{error}</p>}

          <button type="submit" className="boton-primario boton-ancho">
            Iniciar sesión
          </button>
        </form>

        <p className="enlace-secundario">
          ¿No tienes cuenta?{" "}
          <button type="button" className="boton-enlace" onClick={irARegistro}>
            Regístrate aquí
          </button>
        </p>

        <p className="nota-admin">
          Acceso para: Graduados · Empresas · Administradores
          <br />
          Cuenta admin de prueba: admin@uleam.edu.ec / admin123
        </p>
      </div>
    </div>
  );
}
