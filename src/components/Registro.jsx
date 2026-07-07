// Registro.jsx
// Pantalla de creación de cuenta (pantalla 2 del diseño). El formulario
// cambia sus campos según el rol elegido arriba (Graduado o Empresa).
//
// Al registrarse se crean DOS registros relacionados en localStorage:
//   1) Un usuario en la tabla "usuarios" (correo, password, rol, aprobado: false)
//   2) Un perfil en la tabla "graduados" o "empresas", enlazado
//      mediante el campo "usuarioId"
//
// La cuenta nueva queda con "aprobado: false" — el administrador debe
// aprobarla desde su panel antes de que la persona pueda iniciar sesión.
//
// Props:
//   - rolInicial: "graduado" o "empresa", viene de qué botón se usó en Landing
//   - onRegistroExitoso(): App.jsx la usa para mostrar un mensaje y llevar a Login
//   - irALogin(): cambia a la pantalla de Login
//   - irAInicio(): regresa a la página pública (Landing)

import { useState } from "react";
import {
  getUsuarios,
  setUsuarios,
  getGraduados,
  setGraduados,
  getEmpresas,
  setEmpresas,
  generarId,
} from "../data/storage";
import { CARRERAS } from "../data/constantes";
import {
  esCorreoValido,
  esTextoNoVacio,
  esSoloLetras,
  esTelefonoValido,
  esPasswordValido,
  esAnioValido,
} from "../utils/validadores";

export default function Registro({
  rolInicial,
  onRegistroExitoso,
  irALogin,
  irAInicio,
}) {
  const [rol, setRol] = useState(rolInicial || "graduado");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // Campos de graduado
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [carrera, setCarrera] = useState("");
  const [anioGraduacion, setAnioGraduacion] = useState("");
  const [telefonoGraduado, setTelefonoGraduado] = useState("");

  // Campos de empresa
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [sector, setSector] = useState("");
  const [telefonoEmpresa, setTelefonoEmpresa] = useState("");

  const [error, setError] = useState("");

  function validarCamposComunes() {
    if (!esTextoNoVacio(correo) || !esCorreoValido(correo)) {
      return "Ingresa un correo válido.";
    }
    const usuarios = getUsuarios();
    const correoRepetido = usuarios.some(
      (u) => u.correo.toLowerCase() === correo.trim().toLowerCase()
    );
    if (correoRepetido) {
      return "Ya existe una cuenta registrada con ese correo.";
    }
    if (!esPasswordValido(password)) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    if (password !== confirmarPassword) {
      return "Las contraseñas no coinciden.";
    }
    if (!aceptaTerminos) {
      return "Debes aceptar los términos y condiciones de uso.";
    }
    return "";
  }

  function validarCamposGraduado() {
    if (!esTextoNoVacio(nombres) || !esSoloLetras(nombres)) {
      return "Ingresa un nombre válido (solo letras).";
    }
    if (!esTextoNoVacio(apellidos) || !esSoloLetras(apellidos)) {
      return "Ingresa un apellido válido (solo letras).";
    }
    if (!esTextoNoVacio(carrera)) {
      return "Selecciona tu carrera universitaria.";
    }
    if (!esAnioValido(anioGraduacion)) {
      return "Ingresa un año de graduación válido.";
    }
    if (!esTelefonoValido(telefonoGraduado)) {
      return "El teléfono debe tener entre 7 y 10 dígitos numéricos.";
    }
    return "";
  }

  function validarCamposEmpresa() {
    if (!esTextoNoVacio(nombreEmpresa)) {
      return "Ingresa el nombre de la empresa.";
    }
    if (!esTextoNoVacio(sector) || !esSoloLetras(sector)) {
      return "Ingresa un sector válido (solo letras).";
    }
    if (!esTelefonoValido(telefonoEmpresa)) {
      return "El teléfono debe tener entre 7 y 10 dígitos numéricos.";
    }
    return "";
  }

  function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    let mensaje = validarCamposComunes();
    if (!mensaje) {
      mensaje =
        rol === "graduado" ? validarCamposGraduado() : validarCamposEmpresa();
    }
    if (mensaje) {
      setError(mensaje);
      return;
    }

    // La cuenta se crea "no aprobada" — debe pasar por el administrador
    const nuevoUsuario = {
      id: generarId(),
      correo: correo.trim(),
      password,
      rol,
      activo: true,
      aprobado: false,
    };
    setUsuarios([...getUsuarios(), nuevoUsuario]);

    if (rol === "graduado") {
      const nuevoGraduado = {
        id: generarId(),
        usuarioId: nuevoUsuario.id,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        carrera,
        anioGraduacion: Number(anioGraduacion),
        telefono: telefonoGraduado.trim(),
        habilidades: "",
        experiencia: "",
      };
      setGraduados([...getGraduados(), nuevoGraduado]);
    } else {
      const nuevaEmpresa = {
        id: generarId(),
        usuarioId: nuevoUsuario.id,
        nombreEmpresa: nombreEmpresa.trim(),
        sector: sector.trim(),
        telefono: telefonoEmpresa.trim(),
        descripcion: "",
      };
      setEmpresas([...getEmpresas(), nuevaEmpresa]);
    }

    onRegistroExitoso();
  }

  return (
    <div className="pantalla-auth">
      <div className="fondo-decorativo" />
      <div className="tarjeta-auth tarjeta-registro">
        <button type="button" className="enlace-volver" onClick={irAInicio}>
          ← Volver al inicio
        </button>

        <h2>Crear cuenta nueva</h2>

        <div className="selector-rol">
          <button
            type="button"
            className={rol === "graduado" ? "chip chip-activo" : "chip"}
            onClick={() => setRol("graduado")}
          >
            Graduado
          </button>
          <button
            type="button"
            className={rol === "empresa" ? "chip chip-activo" : "chip"}
            onClick={() => setRol("empresa")}
          >
            Empresa
          </button>
        </div>

        <form onSubmit={manejarEnvio} noValidate>
          {rol === "graduado" ? (
            <>
              <div className="fila-dos-columnas">
                <div className="campo-columna">
                  <label htmlFor="nombres">Nombres</label>
                  <input
                    id="nombres"
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Ej: Karla Jamileth"
                  />
                </div>
                <div className="campo-columna">
                  <label htmlFor="apellidos">Apellidos</label>
                  <input
                    id="apellidos"
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Ej: Andrade Mendoza"
                  />
                </div>
              </div>

              <label htmlFor="correoReg">Correo electrónico</label>
              <input
                id="correoReg"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@uleam.edu.ec"
              />

              <label htmlFor="carrera">Carrera universitaria</label>
              <select
                id="carrera"
                value={carrera}
                onChange={(e) => setCarrera(e.target.value)}
              >
                <option value="">Seleccionar carrera...</option>
                {CARRERAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="fila-dos-columnas">
                <div className="campo-columna">
                  <label htmlFor="anio">Año de graduación</label>
                  <input
                    id="anio"
                    type="number"
                    value={anioGraduacion}
                    onChange={(e) => setAnioGraduacion(e.target.value)}
                    placeholder="Ej: 2025"
                  />
                </div>
                <div className="campo-columna">
                  <label htmlFor="telGrad">Teléfono</label>
                  <input
                    id="telGrad"
                    type="text"
                    value={telefonoGraduado}
                    onChange={(e) => setTelefonoGraduado(e.target.value)}
                    placeholder="Ej: 0987654321"
                  />
                </div>
              </div>

              <div className="fila-dos-columnas">
                <div className="campo-columna">
                  <label htmlFor="passReg">Contraseña</label>
                  <input
                    id="passReg"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="campo-columna">
                  <label htmlFor="passConfirm">Confirmar contraseña</label>
                  <input
                    id="passConfirm"
                    type="password"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <label htmlFor="nomEmpresa">Nombre de la empresa</label>
              <input
                id="nomEmpresa"
                type="text"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                placeholder="Ej: TechSoluciones S.A."
              />

              <label htmlFor="correoReg2">Correo electrónico</label>
              <input
                id="correoReg2"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="contacto@empresa.com"
              />

              <label htmlFor="sector">Sector</label>
              <input
                id="sector"
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Ej: Tecnología"
              />

              <label htmlFor="telEmpresa">Teléfono</label>
              <input
                id="telEmpresa"
                type="text"
                value={telefonoEmpresa}
                onChange={(e) => setTelefonoEmpresa(e.target.value)}
                placeholder="Ej: 0987654321"
              />

              <div className="fila-dos-columnas">
                <div className="campo-columna">
                  <label htmlFor="passReg2">Contraseña</label>
                  <input
                    id="passReg2"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="campo-columna">
                  <label htmlFor="passConfirm2">Confirmar contraseña</label>
                  <input
                    id="passConfirm2"
                    type="password"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                  />
                </div>
              </div>
            </>
          )}

          <label className="fila-checkbox">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
            />
            Acepto los términos y condiciones de uso
          </label>

          {error && <p className="mensaje-error">{error}</p>}

          <button type="submit" className="boton-primario boton-ancho">
            Crear cuenta
          </button>
        </form>

        <p className="enlace-secundario">
          ¿Ya tienes cuenta?{" "}
          <button type="button" className="boton-enlace" onClick={irALogin}>
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
