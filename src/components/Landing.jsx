// Landing.jsx
// Página de inicio pública (pantalla 1 del diseño). Es lo primero que ve
// cualquier visitante, sin necesidad de iniciar sesión. Muestra
// estadísticas reales tomadas de localStorage, y botones para ir a
// registrarse (ya sea como Graduado o como Empresa) o a iniciar sesión.
//
// Props:
//   - irARegistro(rol): App.jsx la usa para abrir el formulario de
//     Registro con el rol ya elegido ("graduado" o "empresa").
//   - irALogin(): abre la pantalla de inicio de sesión.

import { getGraduados, getEmpresas, getVacantes } from "../data/storage";

export default function Landing({ irARegistro, irALogin }) {
  const totalGraduados = getGraduados().length;
  const totalEmpresas = getEmpresas().length;
  const vacantesActivas = getVacantes().filter((v) => v.activa).length;

  return (
    <div className="pagina-landing">
      <header className="topbar-landing">
        <div className="marca-landing">🎓 Empleo ULEAM</div>
        <nav className="nav-landing">
          <button className="enlace-nav enlace-nav-activo">Inicio</button>
          <button className="enlace-nav" onClick={irALogin}>
            Vacantes
          </button>
          <button className="enlace-nav" onClick={irALogin}>
            Empresas
          </button>
          <button className="boton-ingresar" onClick={irALogin}>
            Ingresar
          </button>
        </nav>
      </header>

      <section className="hero-landing">
        <h1>Conectamos graduados con oportunidades</h1>
        <p>
          Plataforma oficial de bolsa de empleo para egresados de la
          Universidad ULEAM
        </p>
        <div className="fila-botones-hero">
          <button
            className="boton-primario"
            onClick={() => irARegistro("graduado")}
          >
            Soy Graduado
          </button>
          <button
            className="boton-secundario boton-secundario-hero"
            onClick={() => irARegistro("empresa")}
          >
            Soy Empresa
          </button>
        </div>
      </section>

      <section className="fila-estadisticas">
        <div className="tarjeta-metrica">
          <span className="numero-grande">{totalGraduados}</span>
          <span className="etiqueta-metrica">Graduados registrados</span>
        </div>
        <div className="tarjeta-metrica">
          <span className="numero-grande">{vacantesActivas}</span>
          <span className="etiqueta-metrica">Vacantes activas</span>
        </div>
        <div className="tarjeta-metrica">
          <span className="numero-grande">{totalEmpresas}</span>
          <span className="etiqueta-metrica">Empresas aliadas</span>
        </div>
      </section>

      <section className="fila-caracteristicas">
        <div className="tarjeta-caracteristica">
          <div className="icono-caracteristica"> </div>
          <div className="titulo-caracteristica">Crea tu perfil</div>
          <div className="desc-caracteristica">
            Registra tu carrera y experiencia
          </div>
        </div>
        <div className="tarjeta-caracteristica">
          <div className="icono-caracteristica"> </div>
          <div className="titulo-caracteristica">Busca empleo</div>
          <div className="desc-caracteristica">
            Filtra por área y modalidad
          </div>
        </div>
        <div className="tarjeta-caracteristica">
          <div className="icono-caracteristica"> </div>
          <div className="titulo-caracteristica">Seguimiento</div>
          <div className="desc-caracteristica">
            Revisa el estado de tus postulaciones
          </div>
        </div>
      </section>

      <footer className="pie-landing">
        © 2026 ULEAM — Bolsa de Empleo para Egresados
      </footer>
    </div>
  );
}
