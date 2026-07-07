// PanelEmpresa.jsx
// Panel del rol Empresa (pantalla 6 del diseño), con menú lateral:
//   - Dashboard: resumen (vacantes activas, postulantes totales) + tabla de postulantes recientes
//   - Nueva vacante: formulario para publicar una vacante
//   - Mis vacantes: lista de vacantes publicadas, cerrar/reabrir
//   - Postulantes: tabla con TODOS los postulantes de todas las vacantes, permite cambiar el estado
//   - Mi empresa: editar perfil de la empresa
//
// Props:
//   - usuario: el usuario logueado (viene de App.jsx)

import { useState } from "react";
import {
  getEmpresas,
  setEmpresas,
  getVacantes,
  setVacantes,
  getGraduados,
  getPostulaciones,
  setPostulaciones,
  generarId,
  nombreCompletoGraduado,
} from "../data/storage";
import { AREAS, MODALIDADES, TIPOS_CONTRATO, ESTADOS_POSTULACION } from "../data/constantes";
import { esTextoNoVacio, esSoloLetras } from "../utils/validadores";
import Sidebar from "./Sidebar";

const ITEMS_MENU = [
  { clave: "dashboard", etiqueta: "Dashboard", icono: "" },
  { clave: "nueva", etiqueta: "Nueva vacante", icono: "" },
  { clave: "vacantes", etiqueta: "Mis vacantes", icono: "" },
  { clave: "postulantes", etiqueta: "Postulantes", icono: "" },
  { clave: "perfil", etiqueta: "Mi empresa", icono: "" },
];

export default function PanelEmpresa({ usuario }) {
  const [seccion, setSeccion] = useState("dashboard");

  const empresaActual = getEmpresas().find((e) => e.usuarioId === usuario.id);

  const [perfil, setPerfil] = useState(empresaActual);
  const [errorPerfil, setErrorPerfil] = useState("");
  const [mensajePerfil, setMensajePerfil] = useState("");

  const [titulo, setTitulo] = useState("");
  const [area, setArea] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [tipoContrato, setTipoContrato] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [requisitos, setRequisitos] = useState("");
  const [salario, setSalario] = useState("");
  const [errorVacante, setErrorVacante] = useState("");
  const [mensajeVacante, setMensajeVacante] = useState("");

  const [vacantes, setVacantesState] = useState(getVacantes());
  const [postulaciones, setPostulacionesState] = useState(getPostulaciones());
  const [vacanteExpandida, setVacanteExpandida] = useState(null);

  function irASeccion(clave) {
    setVacantesState(getVacantes());
    setPostulacionesState(getPostulaciones());
    setSeccion(clave);
  }

  function guardarPerfil(e) {
    e.preventDefault();
    setErrorPerfil("");

    if (!esTextoNoVacio(perfil.nombreEmpresa)) {
      setErrorPerfil("Ingresa el nombre de la empresa.");
      return;
    }
    if (!esTextoNoVacio(perfil.sector) || !esSoloLetras(perfil.sector)) {
      setErrorPerfil("El sector solo debe contener letras.");
      return;
    }

    const actualizados = getEmpresas().map((e) =>
      e.usuarioId === usuario.id ? { ...perfil } : e
    );
    setEmpresas(actualizados);
    setMensajePerfil("Perfil de empresa actualizado.");
    setTimeout(() => setMensajePerfil(""), 2500);
  }

  function publicarVacante(e) {
    e.preventDefault();
    setErrorVacante("");

    if (!esTextoNoVacio(titulo)) {
      setErrorVacante("El título es obligatorio.");
      return;
    }
    if (!esTextoNoVacio(area)) {
      setErrorVacante("Selecciona el área de la vacante.");
      return;
    }
    if (!esTextoNoVacio(modalidad)) {
      setErrorVacante("Selecciona la modalidad de trabajo.");
      return;
    }
    if (!esTextoNoVacio(tipoContrato)) {
      setErrorVacante("Selecciona el tipo de contrato.");
      return;
    }
    if (!esTextoNoVacio(descripcion)) {
      setErrorVacante("La descripción es obligatoria.");
      return;
    }
    if (!esTextoNoVacio(requisitos)) {
      setErrorVacante("Los requisitos son obligatorios.");
      return;
    }

    const nuevaVacante = {
      id: generarId(),
      empresaId: empresaActual.id,
      titulo: titulo.trim(),
      area,
      modalidad,
      tipoContrato,
      descripcion: descripcion.trim(),
      requisitos: requisitos.trim(),
      salario: salario.trim(),
      activa: true,
      fechaPublicacion: new Date().toLocaleDateString("es-EC"),
    };

    const actualizadas = [...getVacantes(), nuevaVacante];
    setVacantes(actualizadas);
    setVacantesState(actualizadas);

    setTitulo("");
    setArea("");
    setModalidad("");
    setTipoContrato("");
    setDescripcion("");
    setRequisitos("");
    setSalario("");
    setMensajeVacante("Vacante publicada correctamente.");
    setTimeout(() => setMensajeVacante(""), 2500);
  }

  function alternarEstadoVacante(vacanteId) {
    const actualizadas = getVacantes().map((v) =>
      v.id === vacanteId ? { ...v, activa: !v.activa } : v
    );
    setVacantes(actualizadas);
    setVacantesState(actualizadas);
  }

  function cambiarEstadoPostulacion(postulacionId, nuevoEstado) {
    const actualizadas = getPostulaciones().map((p) =>
      p.id === postulacionId ? { ...p, estado: nuevoEstado } : p
    );
    setPostulaciones(actualizadas);
    setPostulacionesState(actualizadas);
  }

  function postulantesDeVacante(vacanteId) {
    const postulacionesDeEsta = getPostulaciones().filter(
      (p) => p.vacanteId === vacanteId
    );
    const graduados = getGraduados();
    return postulacionesDeEsta.map((p) => {
      const graduado = graduados.find((g) => g.id === p.graduadoId);
      return { ...p, graduado };
    });
  }

  const misVacantes = vacantes.filter((v) => v.empresaId === empresaActual?.id);
  const idsVacantesPropias = misVacantes.map((v) => v.id);
  const todosLosPostulantes = postulaciones
    .filter((p) => idsVacantesPropias.includes(p.vacanteId))
    .map((p) => {
      const graduado = getGraduados().find((g) => g.id === p.graduadoId);
      const vacante = misVacantes.find((v) => v.id === p.vacanteId);
      return { ...p, graduado, vacante };
    })
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  const vacantesActivasCount = misVacantes.filter((v) => v.activa).length;

  return (
    <div className="disposicion-con-sidebar">
      <Sidebar
        titulo="Empresa"
        items={ITEMS_MENU}
        activo={seccion}
        onSeleccionar={irASeccion}
      />

      <div className="area-principal">
        {seccion === "dashboard" && (
          <>
            <h3>Resumen</h3>
            <div className="cuadricula-tarjetas cuadricula-dos">
              <div className="tarjeta-metrica">
                <span className="numero-grande">{vacantesActivasCount}</span>
                <span className="etiqueta-metrica">Vacantes activas</span>
              </div>
              <div className="tarjeta-metrica">
                <span className="numero-grande">{todosLosPostulantes.length}</span>
                <span className="etiqueta-metrica">Postulantes totales</span>
              </div>
            </div>

            <h4 className="subtitulo-seccion">Postulantes recientes</h4>
            <div className="tabla-envoltorio">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Candidato</th>
                    <th>Vacante</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {todosLosPostulantes.length === 0 && (
                    <tr>
                      <td colSpan="4" className="celda-vacia">
                        Aún no tienes postulantes.
                      </td>
                    </tr>
                  )}
                  {todosLosPostulantes.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td>{nombreCompletoGraduado(p.graduado)}</td>
                      <td>{p.vacante ? p.vacante.titulo : "—"}</td>
                      <td>
                        <span className={claseEstado(p.estado)}>
                          {p.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="boton-enlace"
                          onClick={() => irASeccion("postulantes")}
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {seccion === "nueva" && (
          <form className="formulario-panel" onSubmit={publicarVacante} noValidate>
            <h3>Publicar nueva vacante</h3>
            <label>Título del puesto</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Desarrollador Frontend Junior"
            />

            <div className="fila-dos-columnas">
              <div className="campo-columna">
                <label>Área</label>
                <select value={area} onChange={(e) => setArea(e.target.value)}>
                  <option value="">Seleccionar área...</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div className="campo-columna">
                <label>Modalidad</label>
                <select
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value)}
                >
                  <option value="">Seleccionar modalidad...</option>
                  {MODALIDADES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label>Tipo de contrato</label>
            <select
              value={tipoContrato}
              onChange={(e) => setTipoContrato(e.target.value)}
            >
              <option value="">Seleccionar tipo...</option>
              {TIPOS_CONTRATO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label>Descripción</label>
            <textarea
              rows="3"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe las funciones del puesto..."
            />

            <label>Requisitos</label>
            <textarea
              rows="3"
              value={requisitos}
              onChange={(e) => setRequisitos(e.target.value)}
              placeholder="Ej: Conocimientos en React, disponibilidad inmediata..."
            />

            <label>Salario (opcional)</label>
            <input
              type="text"
              value={salario}
              onChange={(e) => setSalario(e.target.value)}
              placeholder="Ej: $600 o $600-800"
            />

            {errorVacante && <p className="mensaje-error">{errorVacante}</p>}
            {mensajeVacante && <p className="mensaje-exito">{mensajeVacante}</p>}

            <button type="submit" className="boton-primario">
              Publicar vacante
            </button>
          </form>
        )}

        {seccion === "vacantes" && (
          <>
            <h3>Mis vacantes</h3>
            <div className="lista-vacantes">
              {misVacantes.length === 0 && (
                <p className="texto-vacio">Aún no has publicado vacantes.</p>
              )}
              {misVacantes.map((v) => {
                const postulantes = postulantesDeVacante(v.id);
                const expandida = vacanteExpandida === v.id;
                return (
                  <div className="tarjeta-vacante" key={v.id}>
                    <div className="encabezado-vacante">
                      <h3>{v.titulo}</h3>
                      <span
                        className={
                          v.activa
                            ? "distintivo distintivo-verde"
                            : "distintivo distintivo-rojo"
                        }
                      >
                        {v.activa ? "Activa" : "Cerrada"}
                      </span>
                    </div>
                    <p>{v.descripcion}</p>
                    <div className="fila-etiquetas">
                      <span className="etiqueta-tag">{v.area}</span>
                      <span className="etiqueta-tag">{v.modalidad}</span>
                      <span className="etiqueta-tag">{v.tipoContrato}</span>
                    </div>

                    <div className="celda-acciones">
                      <button
                        className="boton-mini"
                        onClick={() => alternarEstadoVacante(v.id)}
                      >
                        {v.activa ? "Cerrar vacante" : "Reabrir vacante"}
                      </button>
                      <button
                        className="boton-mini"
                        onClick={() =>
                          setVacanteExpandida(expandida ? null : v.id)
                        }
                      >
                        {expandida
                          ? "Ocultar postulantes"
                          : `Ver postulantes (${postulantes.length})`}
                      </button>
                    </div>

                    {expandida && (
                      <div className="tabla-envoltorio">
                        <table className="tabla">
                          <thead>
                            <tr>
                              <th>Nombre</th>
                              <th>Carrera</th>
                              <th>Contacto</th>
                              <th>Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {postulantes.length === 0 && (
                              <tr>
                                <td colSpan="4" className="celda-vacia">
                                  Sin postulantes todavía.
                                </td>
                              </tr>
                            )}
                            {postulantes.map((p) => (
                              <tr key={p.id}>
                                <td>{nombreCompletoGraduado(p.graduado)}</td>
                                <td>{p.graduado ? p.graduado.carrera : "—"}</td>
                                <td>{p.graduado ? p.graduado.telefono : "—"}</td>
                                <td>{p.fecha}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {seccion === "postulantes" && (
          <>
            <h3>Todos los postulantes</h3>
            <div className="tabla-envoltorio">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Candidato</th>
                    <th>Carrera</th>
                    <th>Vacante</th>
                    <th>Contacto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {todosLosPostulantes.length === 0 && (
                    <tr>
                      <td colSpan="5" className="celda-vacia">
                        Aún no tienes postulantes.
                      </td>
                    </tr>
                  )}
                  {todosLosPostulantes.map((p) => (
                    <tr key={p.id}>
                      <td>{nombreCompletoGraduado(p.graduado)}</td>
                      <td>{p.graduado ? p.graduado.carrera : "—"}</td>
                      <td>{p.vacante ? p.vacante.titulo : "—"}</td>
                      <td>{p.graduado ? p.graduado.telefono : "—"}</td>
                      <td>
                        <select
                          className="selector-estado"
                          value={p.estado}
                          onChange={(e) =>
                            cambiarEstadoPostulacion(p.id, e.target.value)
                          }
                        >
                          {ESTADOS_POSTULACION.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {seccion === "perfil" && perfil && (
          <form className="formulario-panel" onSubmit={guardarPerfil} noValidate>
            <h3>Mi empresa</h3>
            <label>Nombre de la empresa</label>
            <input
              type="text"
              value={perfil.nombreEmpresa}
              onChange={(e) =>
                setPerfil({ ...perfil, nombreEmpresa: e.target.value })
              }
            />

            <label>Sector</label>
            <input
              type="text"
              value={perfil.sector}
              onChange={(e) => setPerfil({ ...perfil, sector: e.target.value })}
            />

            <label>Teléfono</label>
            <input
              type="text"
              value={perfil.telefono}
              onChange={(e) =>
                setPerfil({ ...perfil, telefono: e.target.value })
              }
            />

            <label>Descripción de la empresa</label>
            <textarea
              rows="3"
              value={perfil.descripcion}
              onChange={(e) =>
                setPerfil({ ...perfil, descripcion: e.target.value })
              }
              placeholder="Ej: Empresa dedicada al desarrollo de software..."
            />

            {errorPerfil && <p className="mensaje-error">{errorPerfil}</p>}
            {mensajePerfil && <p className="mensaje-exito">{mensajePerfil}</p>}

            <button type="submit" className="boton-primario">
              Guardar cambios
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Devuelve la clase CSS del "badge" según el estado de la postulación.
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
