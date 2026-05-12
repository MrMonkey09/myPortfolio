# 🐒 MrMonkey09 Portfolio

Un portafolio personal moderno y dinámico diseñado para destacar proyectos y experiencias. Este proyecto utiliza un stack ágil optimizado tanto para experiencia de desarrollo fluida como para despliegues eficientes en entornos de *shared hosting* (cPanel). 

## 🏗️ Arquitectura y Tecnologías

El proyecto fue reestructurado en tres dominios principales para garantizar alta portabilidad:

### 1. Frontend (`/frontend`)
- Construido sobre **React 19**, **TypeScript** y **Vite**.
- Estilado artesanal (CSS Vanilla puro) para control total y estéticas Premium, evitando la dependencia de frameworks de utilidades UI.
- Arquitectura orientada a componentes modulares.
- Conecta dinámicamente con el backend de contacto vía variables de entorno (`import.meta.env.VITE_BASE_URL`).

### 2. Backend (`/backend`)
- Enrutamiento REST Serverless nativo en **PHP 8+** (`enviar.php`).
- Módulo encargado de recepcionar mensajes del formulario y empujarlos directamente hacia una **Base de Datos de Notion** vía Notion API con `cURL`.
- Originalmente escrito en Node.js, pivoteado inteligentemente hacia PHP para asegurar un 100% de compatibilidad operativa con entornos compartidos **cPanel**.
- Cuenta con un micro-parser para soportar lecturas fluidas del archivo `.env` en producción.

### 3. Tooling y DevOps (`/scripts`)
- Scripts en \`Node.js\` nativo para evitar cuellos de botella de transpilación al desplegar.
- **`local.js`**: Lanzador atómico de concurrencia que permite levantar en un solo comando el frontend (*Vite server*) junto al backend en simultáneo (*PHP Built-In server local*).
- **`deploy.js`**: Pipeline FTP (`basic-ftp`) automatizado que compila y empuja los artefactos hacia producción según la configuración en `.env.deploy`.

---

## 🚀 Cómo Empezar (Desarrollo Local)

### 1. Variables de Entorno y Credenciales
El sistema requiere claves secretas de Notion, FTP y tokens de acceso para levantar.
1. Haz una copia segura de `backend/.env.example` y renómbralo a `backend/.env`. Introduce allí tus tokens reales de **Notion**.
2. Haz lo mismo con `.env.deploy.example` a `.env.deploy` (en la raíz) y coloca las llaves de acceso a tu servidor FTP de cPanel.

### 2. Instalación de Dependencias
```bash
# Frontend
cd frontend
npm install

# Scripts y Tooling 
cd ../scripts
npm install
cd ..
```

### 3. Levantar Entorno Híbrido Cero-Docker
El orquestador enlazará magia pura levantando toda la red:
```bash
node scripts/local.js
```
El log te informará en qué puertos viven ambos micro-servicios de tu PC.

---

## 📦 Despliegues a Producción
Nunca más FTP manuales o FileZilla. Usa nuestros scripts CLI integrados desde la raíz:

```bash
# Lanzar un build y subir Frontend
node scripts/deploy.js frontend

# Lanzar cambios del backend (Notion form)
node scripts/deploy.js backend
```

> **NOTA DE SEGURIDAD PARA PRODUCCIÓN:** El archivo `.env` del backend **NUNCA** se sube ni versiona por el script FTP para cuidarte. Debes crear e inyectar el documento de credenciales directo en el gestor de archivos de tu cPanel la primera vez.
