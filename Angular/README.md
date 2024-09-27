
# Fontend (Angular)

Este es un proyecto de **Angular** que incluye múltiples componentes como una página de login, registro, verificación, y un sistema de autenticación. A continuación, encontrarás una descripción detallada sobre cómo configurar y ejecutar el proyecto.

## Requisitos previos

- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [Angular CLI](https://angular.io/cli) (version 17)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone git@github.com:PauRoselloInetum/Proyecto.git
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

## Ejecución

Para ejecutar la aplicación en modo desarrollo:

```bash
ng serve
```

Abre tu navegador y navega a `http://localhost:4200/`.

## Estructura del Proyecto

- `src/app`: Contiene todos los componentes de la aplicación.
  - `404`: Componente para manejar páginas no encontradas.
  - `login`, `register`, `forgot-password`, `reset-password`, `verification`: Componentes de autenticación.
  - `header`: Componente del encabezado de la aplicación.
  - `landing-page`: Página de inicio de la aplicación.
  - `loading`: Componente para mostrar indicadores de carga.
  - `src/assets`: Contiene archivos estáticos como CSS y fuentes.
    - `css`: Archivos CSS para los distintos componentes.
    - `fonts`: Fuente utilizada en la aplicación.
  

- `components`: Contiene todos los componentes de la aplicación (para verlos ordenadamente), tambien permite el borrado de usuario y el borrado de Cookies **Es un componente temporal**.

## Rutas

El archivo `app.routes.ts` define las rutas principales de la aplicación:

- `/login`: Página de inicio de sesión
- `/register`: Página de registro
- `/forgot-password`: Recuperación de contraseña
- `/reset-password`: Reseteo de contraseña
- `/verification`: Verificación de usuario
- `/404`: Página de error para rutas no encontradas

- `/components`: Contiene todos los componentes possibles

## Servicios

El proyecto incluye un servicio de autenticación (`auth.service.ts`) que gestiona las operaciones de login, registro y verificación.

## Personalización del CSS

Cada componente tiene su propio archivo de estilo en `src/assets/css`, lo que permite personalizar el diseño de cada parte de la aplicación de manera aislada.

## Compilación

Para compilar la aplicación para producción:

```bash
ng build --prod
```

Los archivos compilados se generarán en la carpeta `dist/`.
