# Reglas de Revisión para GGA

## General
- Respetar formato y estructura del proyecto.
- Seguir los principios de Clean Code y buenas prácticas.

## API y Data Fetching
- Usa correctamente los tipos y evita depender del enlazado implícito de tipos (`any`).
- Mantén el backend (carpeta `/api`) con formato CommonJS/ESM según se definió.

## Frontend UI / Componentes
- Todos los componentes React deben ser definidos como funciones.
- Utiliza interfaces en el archivo `types/index.ts` para inferencia correcta.
- Respetar inmutabilidad con validadores de solo lectura (`readonly`).
- Usar imports relativos limpios, en la medida de lo posible configurados junto al Vite config y TS.

## Git Workflow
- Usa Commits Atómicos.
- Estructurado base a Git Conventional Commits (feat, fix, refactor, chore, docs, style).
