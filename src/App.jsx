// App.jsx
// Componente raíz de la aplicación.
//
// Aquí NO usamos una librería de rutas (como react-router). En su lugar,
// controlamos "qué pantalla se muestra" con un simple useState. Esto es
// más sencillo de entender cuando se está empezando con React:
//   - "landing"  -> página pública de inicio (antes de iniciar sesión)
//   - "login"    -> formulario de inicio de sesión
//   - "registro" -> formulario de creación de cuenta
//   - si hay "usuario" logueado -> se muestra el panel según su rol

import { useEffect, useState } from "react";
import { inicializarDatos } from "./data/storage";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Registro from "./components/Registro";
import Navbar from "./components/Navbar";
import PanelAdmin from "./components/PanelAdmin";
import PanelGraduado from "./components/PanelGraduado";
import PanelEmpresa from "./components/PanelEmpresa";
import "./App.css";

export default function App() {
  // Controla qué pantalla pública se muestra mientras nadie ha iniciado sesión.
  const [vista, setVista] = useState("landing"); // "landing" | "login" | "registro"

  // Rol con el que se abre el formulario de Registro (viene de los
  // botones "Soy Graduado" / "Soy Empresa" en la página de inicio).
  const [rolParaRegistro, setRolParaRegistro] = useState("graduado");

  // Mensaje que se muestra en el Login justo después de registrarse.
  const [avisoRegistro, setAvisoRegistro] = useState("");

  // Guarda el usuario que inició sesión. Mientras sea "null", significa
  // que nadie ha iniciado sesión todavía.
  const [usuario, setUsuario] = useState(null);

  // Se ejecuta una sola vez, apenas se abre la app: crea el usuario
  // administrador por defecto si todavía no existe en localStorage.
  useEffect(() => {
    inicializarDatos();
  }, []);

  function abrirRegistro(rol) {
    setRolParaRegistro(rol);
    setVista("registro");
  }

  function alRegistrarseExitosamente() {
    setAvisoRegistro(
      "Cuenta creada correctamente. Un administrador debe aprobarla antes de que puedas iniciar sesión."
    );
    setVista("login");
  }

  // Cierra sesión: borra el usuario actual y regresa a la página de inicio.
  function cerrarSesion() {
    setUsuario(null);
    setVista("landing");
  }

  // --- Caso 1: nadie ha iniciado sesión todavía ---
  if (!usuario) {
    if (vista === "landing") {
      return (
        <Landing
          irARegistro={abrirRegistro}
          irALogin={() => setVista("login")}
        />
      );
    }

    return (
      <div className="pantalla-auth">
        <div className="fondo-decorativo" />
        {vista === "login" ? (
          <Login
            onLogin={setUsuario}
            irARegistro={() => setVista("registro")}
            irAInicio={() => setVista("landing")}
            avisoInicial={avisoRegistro}
          />
        ) : (
          <Registro
            rolInicial={rolParaRegistro}
            onRegistroExitoso={alRegistrarseExitosamente}
            irALogin={() => setVista("login")}
            irAInicio={() => setVista("landing")}
          />
        )}
      </div>
    );
  }

  // --- Caso 2: ya hay un usuario logueado ---
  // Mostramos la barra superior (Navbar) y, debajo, el panel que
  // corresponde según el rol del usuario (solo uno se muestra a la vez).
  return (
    <div className="app-shell">
      <Navbar usuario={usuario} onCerrarSesion={cerrarSesion} />
      {usuario.rol === "admin" && <PanelAdmin usuario={usuario} />}
      {usuario.rol === "graduado" && <PanelGraduado usuario={usuario} />}
      {usuario.rol === "empresa" && <PanelEmpresa usuario={usuario} />}
    </div>
  );
}
