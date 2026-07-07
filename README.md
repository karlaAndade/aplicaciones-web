# Bolsa de Empleo — Graduados ULEAM

Sistema web para conectar graduados de la ULEAM con empresas que publican vacantes.

## Tecnologías

- **React** (con Vite)
- HTML, CSS y JavaScript puro (sin librerías externas de UI ni de manejo de estado)
- **localStorage** como almacenamiento de datos (simula tablas de una base de datos)

## Roles del sistema

1. **Administrador** — gestiona usuarios (graduados y empresas), puede editar, activar/desactivar y eliminar cuentas, y ve un resumen general.
2. **Graduado** — completa su perfil, busca vacantes, postula y revisa su historial de postulaciones.
3. **Empresa** — completa su perfil, publica vacantes, revisa postulantes y puede cerrar/reabrir vacantes.

## Cómo ejecutar el proyecto

```bash
npm install
npm run dev
```

Luego abre la URL que muestra la terminal (normalmente `http://localhost:5173`).

## Cuenta de administrador de prueba

Se crea automáticamente la primera vez que se abre el sistema:

- **Correo:** admin@uleam.edu.ec
- **Contraseña:** admin123

## Cómo publicar el proyecto (hosting gratuito)

1. Sube el proyecto a un repositorio de GitHub o GitLab.
2. Crea una cuenta gratuita en Vercel o Netlify.
3. Conecta el repositorio; ambos detectan automáticamente que es un proyecto Vite + React.
4. Comando de build: `npm run build` — carpeta de salida: `dist`.

## Estructura de carpetas

```
src/
├── components/       Pantallas: Login, Registro, PanelAdmin, PanelGraduado, PanelEmpresa, Navbar
├── data/             storage.js — funciones para leer/escribir en localStorage
├── utils/            validadores.js — funciones de validación de formularios
├── App.jsx           Controla si el usuario está logueado y qué panel mostrar
├── App.css           Estilos de toda la aplicación
└── index.css         Estilos base y variables de diseño
```

## Notas

- Los datos se guardan en el navegador (localStorage), por lo que cada navegador/dispositivo tiene su propia información. Para reiniciar los datos, borra el localStorage del sitio desde las herramientas de desarrollador del navegador.
- Todas las validaciones (correo, contraseña, teléfono, campos obligatorios, etc.) se hacen con JavaScript puro, sin librerías externas.
