// constantes.js
// Listas fijas que se usan en varios formularios (selects/dropdowns),
// para que graduados y empresas elijan de opciones predefinidas en vez
// de escribir texto libre. Esto ordena los datos y facilita los filtros
// de búsqueda de vacantes.

export const CARRERAS = [
  "Ingeniería en Sistemas",
  "Ingeniería Civil",
  "Ingeniería Industrial",
  "Administración de Empresas",
  "Contabilidad y Auditoría",
  "Marketing",
  "Derecho",
  "Enfermería",
  "Medicina",
  "Arquitectura",
  "Turismo",
  "Comunicación Social",
  "Psicología",
  "Educación Básica",
  "Otra",
];

export const AREAS = [
  "Tecnología",
  "Administración",
  "Ventas",
  "Salud",
  "Educación",
  "Construcción",
  "Turismo",
  "Finanzas",
  "Legal",
  "Otra",
];

export const MODALIDADES = ["Presencial", "Remoto", "Híbrido"];

export const TIPOS_CONTRATO = ["Tiempo completo", "Tiempo parcial", "Prácticas"];

// Estados posibles de una postulación. La empresa puede ir cambiando el
// estado a medida que revisa a los candidatos.
export const ESTADOS_POSTULACION = [
  "Enviada",
  "En revisión",
  "Entrevista",
  "Contratado",
  "Descartado",
];
