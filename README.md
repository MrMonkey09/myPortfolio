# 🐒 MrMonkey09 Portfolio

Un portafolio personal moderno y dinámico diseñado para destacar proyectos y experiencias. Este proyecto utiliza un stack ágil optimizado tanto para una experiencia de desarrollo fluida como para despliegues eficientes en entornos de *shared hosting* (cPanel).

## 🚀 Novedades: Cotizador Profesional v2.0.0
El sistema de cotización ha sido elevado a un estándar profesional, permitiendo la simulación detallada de proyectos web con:
- **Client Metadata:** Gestión de RUT, Empresa, Prioridades y Objetivos.
- **Config Snapshots:** Persistencia de tarifas y factores de complejidad por simulación.
- **CRM Sync:** Integración profunda con Notion CRM.

---

## 🏗️ Arquitectura y Tecnologías

El proyecto se divide en tres dominios principales:

### 1. Frontend (`/frontend`)
- **React 19**, **TypeScript** y **Vite**.
- Estética Premium con **Vanilla CSS**.
- Tipado estricto para el modelo de datos profesional.

### 2. Backend & API (`/frontend/api` & `/backend`)
- **Node.js (Express)** para el motor de cotización y persistencia en **SQLite**.
- **PHP 8+** para el receptor de contactos ligero y ultra-compatible.
- Sincronización asíncrona con **Notion API**.

### 3. DevOps & CI/CD (`/.github/workflows` & `/scripts`)
- **GitHub Actions:** Pipeline automatizado de Test, Build y Deploy.
- **FTP Automático:** Despliegue seguro a cPanel mediante `deploy.js`.
- **Integrity Testing:** Suite de tests de integración con **Jest** y **Supertest**.

---

## 📖 Documentación Centralizada
Toda la ingeniería del proyecto está documentada en la carpeta `docs/`:
👉 **[Portal de Documentación](./docs/README.md)**

---

## 🛠️ Desarrollo Local

### 1. Requisitos
- Node.js 20+
- Bun (opcional, recomendado para scripts frontend)

### 2. Configuración
1. Copia `backend/.env.example` a `backend/.env`.
2. Copia `.env.deploy.example` a `.env.deploy`.

### 3. Ejecución
```bash
# Instalar todo
npm run install:all

# Levantar entorno híbrido (Frontend + API)
node scripts/local.js
```

### 4. Testing
```bash
# Ejecutar tests de contratos de API
npm run test:api
```

---

## 📦 Despliegues (CI/CD)
El despliegue es automático al hacer push a la rama `main`. Asegúrate de tener configurados los siguientes **Secrets** en GitHub:
- `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`
- `FTP_FRONTEND_DIR`, `FTP_BACKEND_DIR`, `FTP_BACKEND_URL`

> [!TIP]
> Puedes forzar un despliegue manual usando: `node scripts/deploy.js`
