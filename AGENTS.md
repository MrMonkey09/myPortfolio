# Reglas de Revisión para GGA

## General
- Respetar formato y estructura del proyecto.
- Seguir los principios de Clean Code y buenas prácticas.

## API y Data Fetching
- Usa correctamente los tipos y evita depender del enlazado implícito de tipos (`any`).
- Mantén el backend (carpeta `/api`) con formato ESM.
- **Modelo de Datos:** Todas las simulaciones deben seguir el esquema **v2.0.0** definido en [RFC-005](file:///c:/Users/MrMonkey/Documents/GitHub/myPortfolio/docs/rfc/rfc-005-modelo-datos-profesional.md).

## Testing y CI/CD
- **Obligatorio:** Cada cambio en la lógica de negocio o contratos de API debe incluir o actualizar tests en `frontend/api/__tests__`.
- Ejecutar `npm run test:api` antes de realizar un push.
- El despliegue es automático vía **GitHub Actions** al pushear a `main`.

## Frontend UI / Componentes
- Todos los componentes React deben ser definidos como funciones.
- Utiliza interfaces en el archivo `types/index.ts` para inferencia correcta.
- Respetar inmutabilidad con validadores de solo lectura (`readonly`).
- Usar imports relativos limpios, en la medida de lo posible configurados junto al Vite config y TS.

## Git Workflow
- Usa Commits Atómicos.
- Estructurado base a Git Conventional Commits (feat, fix, refactor, chore, docs, style).

## Nueva Caracteristica En Curso
- Implementación de CI/CD y Testing de Contratos (v2.0.0).
- Portal de Documentación: [docs/README.md](file:///c:/Users/MrMonkey/Documents/GitHub/myPortfolio/docs/README.md)