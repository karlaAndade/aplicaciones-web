// PanelGraduado.jsx
// Panel del rol Graduado (pantallas 4 y 5 del diseño), con menú lateral:
//   - Inicio: resumen de actividad + vacantes recomendadas
//   - Buscar empleo: búsqueda con filtros de área/modalidad + paginación
//   - Mi perfil / CV: editar datos personales, habilidades y experiencia
//   - Mis postulaciones: historial completo
//   - Notificaciones: avisos cuando una empresa cambia el estado de una postulación
//
// Props:
//   - usuario: el usuario logueado (viene de App.jsx)

import { useState } from "react";
import {
  getGraduados,
  setGraduados,
  getVacantes,
  getEmpresas,
  getPostulaciones,
  setPostulaciones,
  generarId,
} from "../data/storage";
import { CARRERAS, AREAS, MODALIDADES } from "../data/constantes";
import {
  esTextoNoVacio,
  esSoloLetras,
  esAnioValido,
  esTelefonoValido,
} from "../utils/validadores";
import Sidebar from "./Sidebar";

const VACANTES_POR_PAGINA = 3;

const ITEMS_MENU = [
  { clave: "inicio", etiqueta: "Inicio", icono: "🏠" },
  { clave: "buscar", etiqueta: "Buscar empleo", icono: "🔎" },
  { clave: "perfil", etiqueta: "Mi perfil / CV", icono: "📄" },
  { clave: "postulaciones", etiqueta: "Mis postulaciones", icono: "📋" },
  { clave: "notificaciones", etiqueta: "Notificaciones", icono: "🔔" },
];

export default function PanelGraduado({ usuario }) {
  const [seccion, setSeccion] = useState("inicio");

  const graduadoActual = getGraduados().find(
    (g) => g.usuarioId === usuario.id
  );

  const [perfil, setPerfil] = useState(graduadoActual);
  const [errorPerfil, setErrorPerfil] = useState("");
  const [mensajePerfil, setMensajePerfil] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("");
  const [pagina, setPagina] = useState(1);

  const [vacantes, setVacantesState] = useState(getVacantes());
  const [empresas] = useState(getEmpresas());
  const [postulaciones, setPostulacionesState] = useState(getPostulaciones());
  const [mensajePostulacion, setMensajePostulacion] = useState("");

  function irASeccion(clave) {
    // Cada vez que se cambia de sección, recargamos los datos más
    // recientes desde localStorage (por si cambiaron en otra pestaña).
    setVacantesState(getVacantes());
    setPostulacionesState(getPostulaciones());
    setSeccion(clave);
  }

  function guardarPerfil(e) {
    e.preventDefault();
    setErrorPerfil("");

    if (!esTextoNoVacio(perfil.nombres) || !esSoloLetras(perfil.nombres)) {
      setErrorPerfil("El nombre solo debe contener letras.");
      return;
    }
    if (!esTextoNoVacio(perfil.apellidos) || !esSoloLetras(perfil.apellidos)) {
      setErrorPerfil("El apellido solo debe contener letras.");
      return;
    }
    if (!esTextoNoVacio(perfil.carrera)) {
      setErrorPerfil("Selecciona tu carrera.");
      return;
    }
    if (!esAnioValido(perfil.anioGraduacion)) {
      setErrorPerfil("Ingresa un año de graduación válido.");
      return;
    }
    if (!esTelefonoValido(perfil.telefono)) {
      setErrorPerfil("El teléfono debe tener entre 7 y 10 dígitos.");
      return;
    }

    const actualizados = getGraduados().map((g) =>
      g.usuarioId === usuario.id ? { ...perfil } : g
    );
    setGraduados(actualizados);
    setMensajePerfil("Perfil actualizado correctamente.");
    setTimeout(() => setMensajePerfil(""), 2500);
  }

  function nombreEmpresa(empresaId) {
    const e = empresas.find((emp) => emp.id === empresaId);
    return e ? e.nombreEmpresa : "Empresa";
  }

  // Revisa si el graduado ya postuló a esta vacante, para no permitir
  // que postule dos veces a la misma (validación de datos duplicados).
  function yaPostulo(vacanteId) {
    return postulaciones.some(
      (p) => p.vacanteId === vacanteId && p.graduadoId === graduadoActual.id
    );
  }

  function postular(vacante) {
    if (yaPostulo(vacante.id)) return; // seguro extra, el botón ya se deshabilita

    const nuevaPostulacion = {
      id: generarId(),
      vacanteId: vacante.id,
      graduadoId: graduadoActual.id,
      fecha: new Date().toLocaleDateString("es-EC"),
      estado: "Enviada",
    };
    const actualizadas = [...getPostulaciones(), nuevaPostulacion];
    setPostulaciones(actualizadas);
    setPostulacionesState(actualizadas);
    setMensajePostulacion(`Postulación enviada a "${vacante.titulo}".`);
    setTimeout(() => setMensajePostulacion(""), 2500);
  }

  // --- Cálculos para las tarjetas de "Resumen de actividad" (Inicio) ---
  const misPostulacionesTodas = postulaciones.filter(
    (p) => p.graduadoId === graduadoActual?.id
  );
  const cantidadEnviadas = misPostulacionesTodas.length;
  const cantidadEnRevision = misPostulacionesTodas.filter(
    (p) => p.estado === "En revisión"
  ).length;
  const cantidadEntrevista = misPostulacionesTodas.filter(
    (p) => p.estado === "Entrevista"
  ).length;
  const hoy = new Date().toLocaleDateString("es-EC");
  const vacantesNuevasHoy = vacantes.filter(
    (v) => v.activa && v.fechaPublicacion === hoy
  ).length;

  // Vacantes recomendadas: activas y aún no postuladas, las 2 más recientes
  const vacantesRecomendadas = vacantes
    .filter((v) => v.activa)
    .slice(-2)
    .reverse();

  // --- Buscar empleo: filtro + paginación ---
  const vacantesFiltradas = vacantes.filter((v) => {
    if (!v.activa) return false;
    const texto = busqueda.trim().toLowerCase();
    const coincideTexto =
      !texto ||
      v.titulo.toLowerCase().includes(texto) ||
      nombreEmpresa(v.empresaId).toLowerCase().includes(texto);
    const coincideArea = !filtroArea || v.area === filtroArea;
    const coincideModalidad = !filtroModalidad || v.modalidad === filtroModalidad;
    return coincideTexto && coincideArea && coincideModalidad;
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(vacantesFiltradas.length / VACANTES_POR_PAGINA)
  );
  const paginaSegura = Math.min(pagina, totalPaginas);
  const vacantesPagina = vacantesFiltradas.slice(
    (paginaSegura - 1) * VACANTES_POR_PAGINA,
    paginaSegura * VACANTES_POR_PAGINA
  );

  // --- Notificaciones: postulaciones cuyo estado ya no es "Enviada" ---
  const notificaciones = misPostulacionesTodas
    .filter((p) => p.estado !== "Enviada")
    .map((p) => {
      const vacante = getVacantes().find((v) => v.id === p.vacanteId);
      return { ...p, vacante };
    });

  return (
    <div className="disposicion-con-sidebar">
      <Sidebar
        titulo="Menú"
        items={ITEMS_MENU}
        activo={seccion}
        onSeleccionar={irASeccion}
      />

      <div className="area-principal">
        {seccion === "inicio" && (
          <>
            <h3>Resumen de actividad</h3>
            <div className="cuadricula-tarjetas cuadricula-cuatro">
              <div className="tarjeta-metrica">
                <span className="numero-grande">{cantidadEnviadas}</span>
                <span className="etiqueta-metrica">Postulaciones enviadas</span>
              </div>
              <div className="tarjeta-metrica">
                <span className="numero-grande">{cantidadEnRevision}</span>
                <span className="etiqueta-metrica">En revisión</span>
              </div>
              <div className="tarjeta-metrica">
                <span className="numero-grande">{cantidadEntrevista}</span>
                <span className="etiqueta-metrica">Entrevista agendada</span>
              </div>
              <div className="tarjeta-metrica">
                <span className="numero-grande">{vacantesNuevasHoy}</span>
                <span className="etiqueta-metrica">Vacantes nuevas hoy</span>
              </div>
            </div>

            <h4 className="subtitulo-seccion">Vacantes recomendadas</h4>
            <div className="lista-vacantes">
              {vacantesRecomendadas.length === 0 && (
                <p className="texto-vacio">
                  Aún no hay vacantes publicadas.
                </p>
              )}
              {vacantesRecomendadas.map((v) => (
                <div className="tarjeta-vacante" key={v.id}>
                  <div className="encabezado-vacante">
                    <h3>{v.titulo}</h3>
                  </div>
                  <p className="empresa-vacante">
                    {nombreEmpresa(v.empresaId)}
                  </p>
                  <div className="fila-etiquetas">
                    <span className="etiqueta-tag">{v.modalidad}</span>
                    <span className="etiqueta-tag">{v.tipoContrato}</span>
                  </div>
                  <button
                    className={
                      yaPostulo(v.id)
                        ? "boton-mini boton-mini-aplicado"
                        : "boton-mini boton-mini-primario"
                    }
                    disabled={yaPostulo(v.id)}
                    onClick={() => postular(v)}
                  >
                    {yaPostulo(v.id) ? "Aplicado ✓" : "Postular"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {seccion === "buscar" && (
          <>
            <div className="barra-filtros">
              <input
                type="text"
                className="campo-busqueda campo-busqueda-flex"
                placeholder="Cargo, empresa o palabra clave..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
              />
              <select
                className="selector-filtro"
                value={filtroArea}
                onChange={(e) => {
                  setFiltroArea(e.target.value);
                  setPagina(1);
                }}
              >
                <option value="">Área</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <select
                className="selector-filtro"
                value={filtroModalidad}
                onChange={(e) => {
                  setFiltroModalidad(e.target.value);
                  setPagina(1);
                }}
              >
                <option value="">Modalidad</option>
                {MODALIDADES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <p className="texto-resultado">
              Mostrando {vacantesFiltradas.length} resultado
              {vacantesFiltradas.length !== 1 ? "s" : ""}
            </p>

            {mensajePostulacion && (
              <p className="mensaje-exito">{mensajePostulacion}</p>
            )}

            <div className="lista-vacantes">
              {vacantesPagina.length === 0 && (
                <p className="texto-vacio">
                  No se encontraron vacantes con esos filtros.
                </p>
              )}
              {vacantesPagina.map((v) => (
                <div className="tarjeta-vacante" key={v.id}>
                  <div className="encabezado-vacante">
                    <h3>{v.titulo}</h3>
                  </div>
                  <p className="empresa-vacante">
                    {nombreEmpresa(v.empresaId)} · Publicado {v.fechaPublicacion}
                  </p>
                  <p>{v.descripcion}</p>
                  <p className="requisitos-vacante">
                    <strong>Requisitos:</strong> {v.requisitos}
                  </p>
                  <div className="fila-etiquetas">
                    <span className="etiqueta-tag">{v.tipoContrato}</span>
                    <span className="etiqueta-tag">{v.modalidad}</span>
                    {v.salario && (
                      <span className="etiqueta-tag">{v.salario}</span>
                    )}
                  </div>
                  <button
                    className={
                      yaPostulo(v.id)
                        ? "boton-primario boton-deshabilitado"
                        : "boton-primario"
                    }
                    disabled={yaPostulo(v.id)}
                    onClick={() => postular(v)}
                  >
                    {yaPostulo(v.id) ? "Ya postulaste" : "Postular"}
                  </button>
                </div>
              ))}
            </div>

            {vacantesFiltradas.length > VACANTES_POR_PAGINA && (
              <div className="controles-paginacion">
                <button
                  className="boton-mini"
                  disabled={paginaSegura === 1}
                  onClick={() => setPagina(paginaSegura - 1)}
                >
                  ← Anterior
                </button>
                <span>
                  Página {paginaSegura} de {totalPaginas}
                </span>
                <button
                  className="boton-mini"
                  disabled={paginaSegura === totalPaginas}
                  onClick={() => setPagina(paginaSegura + 1)}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}

        {seccion === "perfil" && perfil && (
          <form className="formulario-panel" onSubmit={guardarPerfil} noValidate>
            <h3>Mi perfil / CV</h3>
            <div className="fila-dos-columnas">
              <div className="campo-columna">
                <label>Nombres</label>
                <input
                  type="text"
                  value={perfil.nombres}
                  onChange={(e) =>
                    setPerfil({ ...perfil, nombres: e.target.value })
                  }
                />
              </div>
              <div className="campo-columna">
                <label>Apellidos</label>
                <input
                  type="text"
                  value={perfil.apellidos}
                  onChange={(e) =>
                    setPerfil({ ...perfil, apellidos: e.target.value })
                  }
                />
              </div>
            </div>

            <label>Carrera</label>
            <select
              value={perfil.carrera}
              onChange={(e) => setPerfil({ ...perfil, carrera: e.target.value })}
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
                <label>Año de graduación</label>
                <input
                  type="number"
                  value={perfil.anioGraduacion}
                  onChange={(e) =>
                    setPerfil({ ...perfil, anioGraduacion: e.target.value })
                  }
                />
              </div>
              <div className="campo-columna">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={perfil.telefono}
                  onChange={(e) =>
                    setPerfil({ ...perfil, telefono: e.target.value })
                  }
                />
              </div>
            </div>

            <label>Habilidades (separadas por coma)</label>
            <input
              type="text"
              value={perfil.habilidades}
              onChange={(e) =>
                setPerfil({ ...perfil, habilidades: e.target.value })
              }
              placeholder="Ej: React, Bases de datos, Trabajo en equipo"
            />

            <label>Experiencia breve</label>
            <textarea
              rows="3"
              value={perfil.experiencia}
              onChange={(e) =>
                setPerfil({ ...perfil, experiencia: e.target.value })
              }
              placeholder="Ej: Prácticas preprofesionales en desarrollo web..."
            />

            {errorPerfil && <p className="mensaje-error">{errorPerfil}</p>}
            {mensajePerfil && <p className="mensaje-exito">{mensajePerfil}</p>}

            <button type="submit" className="boton-primario">
              Guardar cambios
            </button>
          </form>
        )}

        {seccion === "postulaciones" && (
          <>
            <h3>Mis postulaciones</h3>
            <div className="tabla-envoltorio">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Vacante</th>
                    <th>Empresa</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {misPostulacionesTodas.length === 0 && (
                    <tr>
                      <td colSpan="4" className="celda-vacia">
                        Aún no has postulado a ninguna vacante.
                      </td>
                    </tr>
                  )}
                  {misPostulacionesTodas.map((p) => {
                    const vacante = getVacantes().find(
                      (v) => v.id === p.vacanteId
                    );
                    return (
                      <tr key={p.id}>
                        <td>{vacante ? vacante.titulo : "(vacante eliminada)"}</td>
                        <td>{vacante ? nombreEmpresa(vacante.empresaId) : "—"}</td>
                        <td>{p.fecha}</td>
                        <td>
                          <span className={claseEstado(p.estado)}>
                            {p.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {seccion === "notificaciones" && (
          <>
            <h3>Notificaciones</h3>
            <div className="lista-notificaciones">
              {notificaciones.length === 0 && (
                <p className="texto-vacio">
                  No tienes notificaciones nuevas. Aquí verás avisos cuando
                  una empresa actualice el estado de tus postulaciones.
                </p>
              )}
              {notificaciones.map((n) => (
                <div className="tarjeta-notificacion" key={n.id}>
                  <span className={claseEstado(n.estado)}>{n.estado}</span>
                  <p>
                    Tu postulación a{" "}
                    <strong>
                      {n.vacante ? n.vacante.titulo : "una vacante"}
                    </strong>{" "}
                    ahora está en estado "{n.estado}".
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Devuelve la clase CSS del "badge" según el estado de la postulación,
// para pintarlo de verde, ámbar o rojo según corresponda.
function claseEstado(estado) {
  if (estado === "Entrevista" || estado === "Contratado") {
    return "distintivo distintivo-verde";
  }
  if (estado === "En revisión") {
    return "distintivo distintivo-ambar";
  }
  if (estado === "Descartado") {
    return "distintivo distintivo-rojo";
  }
  return "distintivo distintivo-neutro";
}
