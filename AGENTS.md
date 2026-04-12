# Reglas de Revisión para GGA

## General
- Respetar formato y estructura del proyecto.
- Seguir los principios de Clean Code y buenas prácticas.

## API y Data Fetching
- Usa correctamente los tipos y evita depender del enlazado implícito de tipos (`any`).
- Mantén el backend PHP con convenciones claras y respuestas JSON consistentes.

## Frontend UI / Componentes
- Todos los componentes React deben ser definidos como funciones.
- Utiliza interfaces en `frontend/src/types/index.ts` para inferencia correcta.
- Respetar inmutabilidad con validadores de solo lectura (`readonly`).
- Usar imports consistentes con alias de Vite/TS cuando aplique.

## Git Workflow
- Usa commits atómicos.
- Estructura los mensajes con Conventional Commits (`feat`, `fix`, `refactor`, `chore`, `docs`, `style`).
