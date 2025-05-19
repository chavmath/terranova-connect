# Terranova Connect - Proyecto Web

Terranova Connect es una plataforma de red social escolar donde los estudiantes y profesores pueden interactuar, compartir publicaciones, participar en actividades, recibir recompensas y gestionar su perfil. Los administradores tienen acceso a una interfaz para gestionar usuarios, actividades y misiones.

## Índice

- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Endpoints API](#endpoints-api)
- [Contribuciones](#contribuciones)

## Instalación

### Requisitos previos

- **Node.js** (v14.0 o superior)
- **NPM** o **Yarn**
- **MongoDB** o cualquier base de datos compatible con el backend (si es necesario)

### Pasos para instalar el proyecto

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/terranova-connect.git
   cd terranova-connect

2. **Instalar dependencias:**

   ```bash
   npm install
   ```
   o

   ```bash
   yarn install
   ```
3. **Iniciar el proyecto**
    ```bash
    npm run dev
    ```
    o
    
    ```bash
    yarn dev
    ```
4. **Acceder a la aplicación:**
    Abre tu navegador y ve a `http://localhost:3000` (o el puerto que se configure).

5. **Backend**
    Asegúrate de tener el backend corriendo también

### Estructura del Proyecto

/public
/src
  /assets           # Archivos de imágenes, iconos, fuentes
  /components       # Componentes reutilizables
  /pages            # Páginas principales (Dashboard, Login, Perfil, etc.)
  /routes           # Rutas de la aplicación
  /styles           # Archivos de estilos (CSS)
  /utils            # Utilidades y helpers
/tests

### Tecnologías utilizadas
- **Frontend:**
  - React.js
  - React Router
  - State Management
  - SweetAlert2
  - CSS
- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - JWT para autenticación

### Funcionalidades
- **Para Uuarios**
  - Crear y actualizar perfil
  - Ver publicaciones de otros usuarios
  - Crear publicaciones
  - Comentar y dar "me gusta" a publicaciones
  - Participar en actividades y misiones
  - Ver recompensas acumuladas y canjearlas.
  - Ver insgnias acumuladas y canjearlas
- **Para Administradores**
  - Gestionar usuarios (crear, editar, eliminar)
  - Gestionar actividades y misiones
  - Gestionar recompensas e insignias
  - Ver estadísticas de uso y participación
  - Aprobar evidencias subidas por los usuarios.

### Autenticación y Autorización
- **Login** Los usuarios pueden iniciar sesión usando su correo y contraseña.
- **2FA** Verificación de dos pasos para una seguridad adicional.
- **Roles** Los usuarios tienen diferentes roles (Estudiante, Profesor, Administrador). El acceso a diferentes rutas y acciones se controla con base en el rol.
- **JWT** Usamos tokens JWT para gestionar la sesión de los usuarios.