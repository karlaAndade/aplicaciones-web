// Navbar.jsx
// Barra superior que se muestra en todas las pantallas DESPUÉS de iniciar
// sesión (Admin, Graduado o Empresa). Muestra el rol, el correo del
// usuario actual y el botón para cerrar sesión.

const NOMBRES_ROL = {
  admin: "Administrador",
  graduado: "Graduado",
  empresa: "Empresa",
};

export default function Navbar({ usuario, onCerrarSesion }) {
  return (
    <header className="barra-navegacion">
      <div className="marca">
        Bolsa<span>Empleo</span> ULEAM
      </div>
      <div className="info-usuario">
        <span className="etiqueta-rol">{NOMBRES_ROL[usuario.rol]}</span>
        <span className="correo-usuario">{usuario.correo}</span>
        <button className="boton-secundario" onClick={onCerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
