# Integración de Backend para Contacto Notion y Despliegues en cPanel

El objetivo de este plan es habilitar el formulario de contacto para que el *frontend* se comunique correctamente con el *backend*, y que el *backend* almacene esa información en una base de datos de Notion. Adicionalmente, crearemos scripts de despliegue automatizado por FTP para ambientes `dev` y `prod` directamente a cPanel.

## User Review Required

> [!IMPORTANT]
> **Compatibilidad de Node.js en cPanel**: Investigamos y tu cPanel **SÍ** soporta NodeJS mediante una aplicación integrada llamada **Passenger** (Phusion Passenger). No es necesario migrar a PHP, lo cual es fantástico porque mantenemos nuestro *stack* unificado.  
> Sin embargo, necesitaré que confirmes si dentro de tu panel de control de cPanel cuentas con la opción **"Setup Node.js App"** (o similar). Esto nos permite desplegar JavaScript del lado del servidor sin problemas.

> [!WARNING]
> Mencionaste que el backend "solo nos conecta a notion y no hace nada". En realidad, el código actual **sí tiene la lógica para escribir en Notion**, pero el problema radical es doble:
> 1. El proyecto backend no tiene un `package.json` formalizado.
> 2. El frontend utiliza rutas quemadas (`https://buzon.skills.avdev.cl`) que no apuntan a nuestro entorno.
> 
> Es importante que entiendas que el backend *hace su trabajo*, pero la **integración** está incompleta.

## Proposed Changes

Vamos a dividir el trabajo en tres frentes:

---

### Backend

El backend actualizaremos su estructura base para que sea un proyecto formal en Node y esté listo para el servidor de producción de cPanel.

#### [NEW] backend/package.json
Inicializaremos el proyecto instalando las dependencias base (`express`, `cors`, `@notionhq/client`, `dotenv`).

#### [MODIFY] backend/index.js
Renombraremos o configuraremos el entry point como `app.js` (o configuraremos Passenger) porque cPanel busca `app.js` por defecto para arrancar aplicaciones Node.js. 

#### [MODIFY] backend/bd.js y backend/notion.routes.js
Optimizaremos la carga de variables de entorno (para que no esté atado sólo a un path estático de "dev.env") para soportar variables de cPanel sin colisionar en producción.

---

### Frontend

El frontend debe desacoplarse del servidor estático configurado en código y en lugar de eso usar variables de entorno reales.

#### [MODIFY] frontend/src/utilities/api.ts
Reemplazaremos la URL *hardcodeada* por llamadas que utilicen `import.meta.env.VITE_BASE_URL`.

#### [MODIFY] frontend/.env.development / frontend/.env.production
Definiremos explícitamente hacia dónde debe apuntar el formulario tanto en local interactuando con el puerto 3001 como al subirse a producción/cPanel.

---

### Scripts de Despliegue

Ya que todo es Javascript/Typescript, la mejor arquitectura para nuestros scripts no es Python ni Bash puro, sino **Node.js**: nos permite correr scripts en Windows o Linux por igual.

#### [NEW] scripts/deploy.js
Crearemos un script que utilice la librería `basic-ftp` u otra similar para:
1. Para el frontend: Correr `npm run build` en modo dev/prod y transferir la carpeta `dist/` a la ruta FTP remota en cPanel.
2. Para el backend: Transferir los archivos necesarios (excluyendo node_modules) a la carpeta de la App Node en cPanel, y desencadenar un reinicio vía `touch tmp/restart.txt` (convención de Passenger).
3. Utilizará un archivo `.env` en la raíz (ignorándolo en git) para tus credenciales seguras de FTP y Host.

## Open Questions

> [!CAUTION]
> 1. ¿Puedes asegurar que tienes acceso al gestor de dependencias **"Setup Node.js App"** en tu cPanel? 
> 2. En producción, ¿qué dominio URL o subdominio vas a utilizar para el *Frontend* y cuál para el *Backend*? (Ej. `mi-portfolio.com` para frontend, y `api.mi-portfolio.com` para backend). Esta pregunta delimitará las rutas del despliegue en nuestro script.

## Verification Plan

### Automated Tests
- Validaremos localmente que al enviar por el webform se levante exitosamente una comunicación con el backend (puerto 3001) y éste escriba un registro de prueba en el Notion DB.

### Manual Verification
- Desplegaremos mediante un `npm run deploy:dev:frontend` y validaremos en el web server si subió.
- Subiremos el Backend a cPanel y consultaremos vía un POST a su URL de despliegue si responde con éxito sin crashear.
