// PanelAdmin.jsx
// Panel del rol Administrador (pantalla 7 del diseño), con menú lateral:
//   - Dashboard: resumen general + tabla de "usuarios pendientes de aprobación"
//   - Gestionar usuarios: tabla de graduados (editar / activar-desactivar / eliminar)
//   - Empresas: misma gestión pero para empresas
//   - Vacantes: todas las vacantes del sistema, con opción de cerrarlas
//   - Reportes: resumen de números clave
//   - Configuración: cambiar la contraseña del administrador
//
// Sobre "aprobado": cuando alguien se registra (Registro.jsx), su cuenta
// queda con aprobado:false. El admin debe Aprobar o Rechazar la cuenta
// desde el Dashboard antes de que esa persona pueda iniciar sesión.

import { useState } from "react";
import {
  getUsuarios,
  setUsuarios,
  getGraduados,
  setGraduados,
  getEmpresas,
  setEmpresas,
  getVacantes,
  setVacantes,
  getPostulaciones,
  setPostulaciones,
  nombreCompletoGraduado,
} from "../data/storage";
import { esTextoNoVacio, esSoloLetras, esPasswordValido } from "../utils/validadores";
import Sidebar from "./Sidebar";

const ITEMS_MENU = [
  { clave: "dashboard", etiqueta: "Dashboard", icono: "" },
  { clave: "graduados", etiqueta: "Gestionar usuarios", icono: "" },
  { clave: "empresas", etiqueta: "Empresas", icono: "" },
  { clave: "vacantes", etiqueta: "Vacantes", icono: "" },
  { clave: "reportes", etiqueta: "Reportes", icono: "" },
  { clave: "configuracion", etiqueta: "Configuración", icono: "" },
];

export default function PanelAdmin({ usuario }) {
  const [seccion, setSeccion] = useState("dashboard");

  const [usuarios, setUsuariosState] = useState(getUsuarios());
  const [graduados, setGraduadosState] = useState(getGraduados());
  const [empresas, setEmpresasState] = useState(getEmpresas());
  const [vacantes, setVacantesState] = useState(getVacantes());
  const [postulaciones, setPostulacionesState] = useState(getPostulaciones());

  const [editando, setEditando] = useState(null); // { usuarioId, valor }
  const [mensaje, setMensaje] = useState("");

  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [errorConfig, setErrorConfig] = useState("");
  const [mensajeConfig, setMensajeConfig] = useState("");

  function irASeccion(clave) {
    recargarTodo();
    setSeccion(clave);
  }

  function recargarTodo() {
    setUsuariosState(getUsuarios());
    setGraduadosState(getGraduados());
    setEmpresasState(getEmpresas());
    setVacantesState(getVacantes());
    setPostulacionesState(getPostulaciones());
  }

  function obtenerNombreMostrar(usuarioFila) {
    if (usuarioFila.rol === "graduado") {
      const g = graduados.find((x) => x.usuarioId === usuarioFila.id);
      return g ? nombreCompletoGraduado(g) : "(sin perfil)";
    }
    if (usuarioFila.rol === "empresa") {
      const e = empresas.find((x) => x.usuarioId === usuarioFila.id);
      return e ? e.nombreEmpresa : "(sin perfil)";
    }
    return "Administrador";
  }

  //Aprobación de cuentas nuevas
  function aprobarUsuario(usuarioId) {
    const actualizados = usuarios.map((u) =>
      u.id === usuarioId ? { ...u, aprobado: true } : u
    );
    setUsuarios(actualizados);
    setUsuariosState(actualizados);
    setMensaje("Cuenta aprobada correctamente.");
    setTimeout(() => setMensaje(""), 2500);
  }

  function rechazarUsuario(usuarioFila) {
    const confirmar = window.confirm(
      "¿Rechazar y eliminar esta solicitud de cuenta? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;
    eliminarUsuario(usuarioFila);
    setMensaje("Solicitud de cuenta rechazada.");
    setTimeout(() => setMensaje(""), 2500);
  }

  function alternarActivo(usuarioId) {
    const actualizados = usuarios.map((u) =>
      u.id === usuarioId ? { ...u, activo: !u.activo } : u
    );
    setUsuarios(actualizados);
    setUsuariosState(actualizados);
  }

  // Elimina una cuenta y, en cascada, todo lo relacionado con ella:
  //   - Si es graduado: se borra su perfil y sus postulaciones.
  //   - Si es empresa: se borran su perfil, sus vacantes y las
  //     postulaciones que recibieron esas vacantes.
  function eliminarUsuario(usuarioFila) {
    const usuariosActualizados = usuarios.filter((u) => u.id !== usuarioFila.id);
    setUsuarios(usuariosActualizados);

    if (usuarioFila.rol === "graduado") {
      const graduado = graduados.find((g) => g.usuarioId === usuarioFila.id);
      const graduadosActualizados = graduados.filter(
        (g) => g.usuarioId !== usuarioFila.id
      );
      setGraduados(graduadosActualizados);
      setGraduadosState(graduadosActualizados);

      if (graduado) {
        const postulacionesActualizadas = getPostulaciones().filter(
          (p) => p.graduadoId !== graduado.id
        );
        setPostulaciones(postulacionesActualizadas);
        setPostulacionesState(postulacionesActualizadas);
      }
    }

    if (usuarioFila.rol === "empresa") {
      const empresa = empresas.find((e) => e.usuarioId === usuarioFila.id);
      const empresasActualizadas = empresas.filter(
        (e) => e.usuarioId !== usuarioFila.id
      );
      setEmpresas(empresasActualizadas);
      setEmpresasState(empresasActualizadas);

      if (empresa) {
        const vacantesDeEmpresa = getVacantes().filter(
          (v) => v.empresaId === empresa.id
        );
        const idsVacantes = vacantesDeEmpresa.map((v) => v.id);

        const vacantesActualizadas = getVacantes().filter(
          (v) => v.empresaId !== empresa.id
        );
        setVacantes(vacantesActualizadas);
        setVacantesState(vacantesActualizadas);

        const postulacionesActualizadas = getPostulaciones().filter(
          (p) => !idsVacantes.includes(p.vacanteId)
        );
        setPostulaciones(postulacionesActualizadas);
        setPostulacionesState(postulacionesActualizadas);
      }
    }

    setUsuariosState(usuariosActualizados);
  }

  function confirmarEliminar(usuarioFila) {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta cuenta? También se eliminará su perfil y datos asociados (vacantes o postulaciones)."
    );
    if (!confirmar) return;
    eliminarUsuario(usuarioFila);
    setMensaje("Cuenta eliminada correctamente.");
    setTimeout(() => setMensaje(""), 2500);
  }

  function iniciarEdicion(usuarioFila) {
    setEditando({
      usuarioId: usuarioFila.id,
      valor: obtenerNombreMostrar(usuarioFila),
    });
  }

  function guardarEdicion(usuarioFila) {
    const nuevoValor = editando.valor;
    if (!esTextoNoVacio(nuevoValor) || !esSoloLetras(nuevoValor)) {
      setMensaje("El nombre solo debe contener letras.");
      setTimeout(() => setMensaje(""), 2500);
      return;
    }

    if (usuarioFila.rol === "graduado") {
      // El campo editable representa "Nombres Apellidos" en un solo texto;
      // lo repartimos de forma simple entre nombres y apellidos.
      const partes = nuevoValor.trim().split(" ");
      const nombres = partes.slice(0, Math.ceil(partes.length / 2)).join(" ");
      const apellidos = partes.slice(Math.ceil(partes.length / 2)).join(" ");
      const actualizados = graduados.map((g) =>
        g.usuarioId === usuarioFila.id
          ? { ...g, nombres: nombres || g.nombres, apellidos: apellidos || g.apellidos }
          : g
      );
      setGraduados(actualizados);
      setGraduadosState(actualizados);
    } else if (usuarioFila.rol === "empresa") {
      const actualizados = empresas.map((e) =>
        e.usuarioId === usuarioFila.id
          ? { ...e, nombreEmpresa: nuevoValor.trim() }
          : e
      );
      setEmpresas(actualizados);
      setEmpresasState(actualizados);
    }
    setEditando(null);
  }

  function cambiarPasswordAdmin(e) {
    e.preventDefault();
    setErrorConfig("");

    if (passwordActual !== usuario.password) {
      setErrorConfig("La contraseña actual no es correcta.");
      return;
    }
    if (!esPasswordValido(passwordNueva)) {
      setErrorConfig("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const actualizados = getUsuarios().map((u) =>
      u.id === usuario.id ? { ...u, password: passwordNueva } : u
    );
    setUsuarios(actualizados);
    setUsuariosState(actualizados);
    setPasswordActual("");
    setPasswordNueva("");
    setMensajeConfig("Contraseña actualizada correctamente.");
    setTimeout(() => setMensajeConfig(""), 2500);
  }

  function alternarEstadoVacante(vacanteId) {
    const actualizadas = getVacantes().map((v) =>
      v.id === vacanteId ? { ...v, activa: !v.activa } : v
    );
    setVacantes(actualizadas);
    setVacantesState(actualizadas);
  }

  const totalGraduados = graduados.length;
  const totalEmpresas = empresas.length;
  const vacantesActivas = vacantes.filter((v) => v.activa).length;
  const totalPostulaciones = postulaciones.length;

  const pendientesAprobacion = usuarios.filter(
    (u) => u.rol !== "admin" && u.aprobado === false
  );
  const graduadosUsuarios = usuarios.filter(
    (u) => u.rol === "graduado" && u.aprobado !== false
  );
  const empresasUsuarios = usuarios.filter(
    (u) => u.rol === "empresa" && u.aprobado !== false
  );

  function nombreEmpresaDeVacante(empresaId) {
    const e = empresas.find((emp) => emp.id === empresaId);
    return e ? e.nombreEmpresa : "—";
  }

  return (
    <div className="disposicion-con-sidebar">
      <Sidebar
        titulo="Admin"
        items={ITEMS_MENU}
        activo={seccion}
        onSeleccionar={irASeccion}
      />

      <div className="area-principal">
        {mensaje && <p className="mensaje-exito">{mensaje}</p>}

        {seccion === "dashboard" && (
          <>
            <h3>Resumen general</h3>
            <div className="cuadricula-tarjetas">
              <div className="tarjeta-metrica">
                <span className="numero-grande">{totalGraduados}</span>
                <span className="etiqueta-metrica">Graduados registrados</span>
              </div>
              <div className="tarjeta-metrica">
                <span className="numero-grande">{totalEmpresas}</span>
                <span className="etiqueta-metrica">Empresas registradas</span>
              </div>
              <div className="tarjeta-metrica">
                <span className="numero-grande">{vacantesActivas}</span>
                <span className="etiqueta-metrica">Vacantes activas</span>
              </div>
            </div>

            <h4 className="subtitulo-seccion">
              Usuarios pendientes de aprobación ({pendientesAprobacion.length})
            </h4>
            <div className="tabla-envoltorio">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Nombre / Empresa</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendientesAprobacion.length === 0 && (
                    <tr>
                      <td colSpan="4" className="celda-vacia">
                        No hay solicitudes pendientes.
                      </td>
                    </tr>
                  )}
                  {pendientesAprobacion.map((u) => (
                    <tr key={u.id}>
                      <td>{obtenerNombreMostrar(u)}</td>
                      <td>{u.correo}</td>
                      <td className="texto-capitalizado">{u.rol}</td>
                      <td className="celda-acciones">
                        <button
                          className="boton-mini boton-mini-primario"
                          onClick={() => aprobarUsuario(u.id)}
                        >
                          Aprobar
                        </button>
                        <button
                          className="boton-mini boton-mini-peligro"
                          onClick={() => rechazarUsuario(u)}
                        >
                          Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {(seccion === "graduados" || seccion === "empresas") && (
          <>
            <h3>{seccion === "graduados" ? "Gestionar usuarios (Graduados)" : "Empresas"}</h3>
            <div className="tabla-envoltorio">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Nombre / Empresa</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(seccion === "graduados" ? graduadosUsuarios : empresasUsuarios)
                    .length === 0 && (
                    <tr>
                      <td colSpan="4" className="celda-vacia">
                        Aún no hay usuarios registrados en esta categoría.
                      </td>
                    </tr>
                  )}
                  {(seccion === "graduados" ? graduadosUsuarios : empresasUsuarios).map(
                    (u) => (
                      <tr key={u.id}>
                        <td>
                          {editando && editando.usuarioId === u.id ? (
                            <input
                              type="text"
                              value={editando.valor}
                              onChange={(e) =>
                                setEditando({ ...editando, valor: e.target.value })
                              }
                            />
                          ) : (
                            obtenerNombreMostrar(u)
                          )}
                        </td>
                        <td>{u.correo}</td>
                        <td>
                          <span
                            className={
                              u.activo
                                ? "distintivo distintivo-verde"
                                : "distintivo distintivo-rojo"
                            }
                          >
                            {u.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="celda-acciones">
                          {editando && editando.usuarioId === u.id ? (
                            <>
                              <button
                                className="boton-mini boton-mini-primario"
                                onClick={() => guardarEdicion(u)}
                              >
                                Guardar
                              </button>
                              <button
                                className="boton-mini"
                                onClick={() => setEditando(null)}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="boton-mini"
                                onClick={() => iniciarEdicion(u)}
                              >
                                Editar
                              </button>
                              <button
                                className="boton-mini"
                                onClick={() => alternarActivo(u.id)}
                              >
                                {u.activo ? "Desactivar" : "Activar"}
                              </button>
                              <button
                                className="boton-mini boton-mini-peligro"
                                onClick={() => confirmarEliminar(u)}
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {seccion === "vacantes" && (
          <>
            <h3>Todas las vacantes</h3>
            <div className="tabla-envoltorio">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Empresa</th>
                    <th>Área</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {vacantes.length === 0 && (
                    <tr>
                      <td colSpan="5" className="celda-vacia">
                        Aún no se han publicado vacantes.
                      </td>
                    </tr>
                  )}
                  {vacantes.map((v) => (
                    <tr key={v.id}>
                      <td>{v.titulo}</td>
                      <td>{nombreEmpresaDeVacante(v.empresaId)}</td>
                      <td>{v.area}</td>
                      <td>
                        <span
                          className={
                            v.activa
                              ? "distintivo distintivo-verde"
                              : "distintivo distintivo-rojo"
                          }
                        >
                          {v.activa ? "Activa" : "Cerrada"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="boton-mini"
                          onClick={() => alternarEstadoVacante(v.id)}
                        >
                          {v.activa ? "Cerrar" : "Reabrir"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {seccion === "reportes" && (
          <>
            <h3>Reportes generales</h3>
            <div className="cuadricula-tarjetas">
              <div className="tarjeta-metrica">
                <span className="numero-grande">{totalGraduados}</span>
                <span className="etiqueta-metrica">Graduados</span>
              </div>
              <div className="tarjeta-metrica">
                <span className="numero-grande">{totalEmpresas}</span>
                <span className="etiqueta-metrica">Empresas</span>
              </div>
              <div className="tarjeta-metrica">
                <span className="numero-grande">{vacantes.length}</span>
                <span className="etiqueta-metrica">Vacantes publicadas</span>
              </div>
              <div className="tarjeta-metrica">
                <span className="numero-grande">{vacantesActivas}</span>
                <span className="etiqueta-metrica">Vacantes activas</span>
              </div>
              <div className="tarjeta-metrica">
                <span className="numero-grande">{totalPostulaciones}</span>
                <span className="etiqueta-metrica">Postulaciones totales</span>
              </div>
              <div className="tarjeta-metrica">
                <span className="numero-grande">{pendientesAprobacion.length}</span>
                <span className="etiqueta-metrica">Cuentas pendientes</span>
              </div>
            </div>
          </>
        )}

        {seccion === "configuracion" && (
          <form
            className="formulario-panel"
            onSubmit={cambiarPasswordAdmin}
            noValidate
          >
            <h3>Configuración de la cuenta</h3>
            <label>Contraseña actual</label>
            <input
              type="password"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
            />

            <label>Nueva contraseña</label>
            <input
              type="password"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />

            {errorConfig && <p className="mensaje-error">{errorConfig}</p>}
            {mensajeConfig && <p className="mensaje-exito">{mensajeConfig}</p>}

            <button type="submit" className="boton-primario">
              Actualizar contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
