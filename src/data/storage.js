// storage.js
// Aquí simulamos una base de datos usando localStorage.
// Cada "tabla" es un array de objetos guardado como JSON bajo una clave.

const KEYS = {
  usuarios: "bolsa_usuarios",
  graduados: "bolsa_graduados",
  empresas: "bolsa_empresas",
  vacantes: "bolsa_vacantes",
  postulaciones: "bolsa_postulaciones",
};

// --- Funciones genéricas ---

function leerTabla(clave) {
  const datos = localStorage.getItem(clave);
  return datos ? JSON.parse(datos) : [];
}

function guardarTabla(clave, arreglo) {
  localStorage.setItem(clave, JSON.stringify(arreglo));
}

export function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// --- Usuarios ---
export const getUsuarios = () => leerTabla(KEYS.usuarios);
export const setUsuarios = (arr) => guardarTabla(KEYS.usuarios, arr);

// --- Graduados ---
export const getGraduados = () => leerTabla(KEYS.graduados);
export const setGraduados = (arr) => guardarTabla(KEYS.graduados, arr);

// --- Empresas ---
export const getEmpresas = () => leerTabla(KEYS.empresas);
export const setEmpresas = (arr) => guardarTabla(KEYS.empresas, arr);

// --- Vacantes ---
export const getVacantes = () => leerTabla(KEYS.vacantes);
export const setVacantes = (arr) => guardarTabla(KEYS.vacantes, arr);

// --- Postulaciones ---
export const getPostulaciones = () => leerTabla(KEYS.postulaciones);
export const setPostulaciones = (arr) => guardarTabla(KEYS.postulaciones, arr);

// --- Inicialización: crea el usuario administrador la primera vez ---
export function inicializarDatos() {
  const usuarios = getUsuarios();
  const existeAdmin = usuarios.some((u) => u.rol === "admin");

  if (!existeAdmin) {
    usuarios.push({
      id: generarId(),
      correo: "admin@uleam.edu.ec",
      password: "admin123",
      rol: "admin",
      activo: true,
      aprobado: true, // el admin no necesita aprobación
    });
    setUsuarios(usuarios);
  }
}

// --- Funciones de ayuda (helpers) ---

// Devuelve "Nombres Apellidos" de un graduado en un solo texto.
export function nombreCompletoGraduado(graduado) {
  if (!graduado) return "";
  return `${graduado.nombres} ${graduado.apellidos}`.trim();
}

