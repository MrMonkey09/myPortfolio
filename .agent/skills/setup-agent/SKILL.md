---
name: setup-agent
description: >
  Configuracion de agentes (.agent, Cursor, Continue, Cline)
license: Apache-2.0
compatibility: opencode
metadata:
  author: MrMonkey09
  version: 1.0
  scope: [root]
  auto_invoke:
    - "Configurar asistentes de IA"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, context7_resolve-library-id, context7_query-docs, engram_mem_context, engram_mem_get_observation, engram_mem_save, engram_mem_save_prompt, engram_mem_search, engram_mem_session_end, engram_mem_session_start, engram_mem_session_summary
---

# Habilidad: Setup Agent

## Objetivo
- Unificar la configuracion de agentes para `.agent`, Cursor, Continue y Cline.
- Generar estructura y reglas coherentes desde `AGENTS.md` y `.agents/skills/`.
- Actuar como responsable de sincronizar la fuente de verdad de OpenCode hacia agentes secundarios exportados.

## Alcance
- Convertir reglas del repositorio a formatos esperados por cada agente.
- Mantener sincronizados nombres, auto-invoke y herramientas permitidas.
- Considerar a OpenCode como agente principal del repo.
- No asumir exports secundarios activos si las carpetas `.agent/`, `.cursor/`, `.continue/` o `.clinerules/` no existen en el repo.

## Entradas
- `AGENTS.md` (reglas globales y comandos).
- `.agents/skills/*/SKILL.md` (metadata y descripciones).
- `C:\Users\MrMonkey\.config\opencode\skills\*` (skills globales del runtime).
- `docs/tablon-de-operaciones.md` (flujo operativo base).

## Salidas Esperadas
- `.agent`: solo si el repo materializa ese export.
- Cursor: `.cursor/rules/` y/o `.cursorrules` si aplica.
- Continue: `continue.json` o config correspondiente.
- Cline: reglas y memoria en su ruta configurada.

## Protocolo
1. Leer `AGENTS.md` y todas las skills.
2. Mapear reglas a cada formato sin perder restricciones.
3. Escribir archivos de configuracion en sus rutas.
4. Verificar que las reglas no se contradigan.
5. Aplicar el checklist comun de gobernanza en `docs/esenciales/guias/checklist-gobernanza-skills-agentes.md`.
6. Verificar que las exports contemplen la memoria persistente con `engram` y la distincion entre skills locales y skills globales de OpenCode.
7. Reportar cambios y archivos generados.

## Reglas de Oro
- NO inventar comandos; usar los definidos en `AGENTS.md`.
- No crear exports fantasma si el repo aun no formalizo agentes secundarios.
- No sobrescribir configuraciones existentes sin aviso.
- Mantener todo en espanol.

## Referencias
- `docs/esenciales/guias/checklist-gobernanza-skills-agentes.md`

## Protocolo piloto de enrutamiento
- En la extension del piloto, `setup-agent` lidera cuando el problema principal es exportar o sincronizar reglas del repo hacia agentes secundarios.
- Si el cambio nace en la definicion interna de una skill, coordinar con `skill-lifecycle` sin absorber sus decisiones de alcance o metadata.
- Si la fuente de verdad `AGENTS.md` aun esta inestable, quedar como skill de apoyo hasta que la gobernanza base se cierre.

## Contrato minimo de handoff
- Al recibir o delegar un handoff, exigir: `objetivo`, `skill-lider`, `skill-destino`, `restricciones`, `archivos/rutas`, `defaults a evitar` y `salida esperada`.
- Si `setup-agent` lidera, conserva la autoridad sobre formato y consistencia de exports hacia `.agent`, Cursor, Continue y Cline.
