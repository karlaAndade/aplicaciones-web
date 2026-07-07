// validadores.js
// Funciones simples de validación con JavaScript puro (sin librerías externas).
// Cada función recibe un valor de un formulario y devuelve "true" si es
// válido o "false" si no lo es. Todos los formularios (Login, Registro,
// PanelGraduado, PanelEmpresa) importan estas funciones antes de guardar
// cualquier dato en localStorage.

// Valida que el texto tenga forma de correo: algo@algo.algo
export function esCorreoValido(correo) {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(correo.trim());
}

// Valida que el campo no esté vacío (ni solo espacios en blanco)
export function esTextoNoVacio(texto) {
  return texto.trim().length > 0;
}

// Valida que el texto contenga solo letras y espacios (con o sin tildes/ñ)
// Se usa para nombres, carreras, sectores, etc.
export function esSoloLetras(texto) {
  const patron = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  return patron.test(texto.trim());
}

// Valida que el texto contenga solo dígitos (0-9)
// Se usa por ejemplo para el salario de una vacante.
export function esSoloNumeros(texto) {
  const patron = /^[0-9]+$/;
  return patron.test(texto.trim());
}

// Valida un número de teléfono: solo dígitos, entre 7 y 10 caracteres
export function esTelefonoValido(texto) {
  const patron = /^[0-9]{7,10}$/;
  return patron.test(texto.trim());
}

// Valida que la contraseña tenga un largo mínimo de seguridad
export function esPasswordValido(password) {
  return password.length >= 6;
}

// Valida que el año de graduación sea un número entero razonable
// (entre 1980 y el año actual, para evitar años inventados o futuros)
export function esAnioValido(anio) {
  const numero = Number(anio);
  const anioActual = new Date().getFullYear();
  return Number.isInteger(numero) && numero >= 1980 && numero <= anioActual;
}
