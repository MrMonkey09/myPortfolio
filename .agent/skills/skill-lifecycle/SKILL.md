---
name: skill-lifecycle
description: >
  Crear, registrar, sincronizar y validar skills locales del repositorio.
  Trigger: Cuando el usuario pida crear una nueva skill, renombrar una skill existente, ajustar metadata, alinear AGENTS.md o sincronizar reglas del lifecycle de skills.
license: Apache-2.0
compatibility: opencode
metadata:
  author: MrMonkey09
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Crear skills"
    - "Renombrar skills"
    - "Ajustar metadata de skills"
    - "Sincronizar AGENTS.md"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task, engram_mem_context, engram_mem_get_observation, engram_mem_save, engram_mem_save_prompt, engram_mem_search, engram_mem_session_end, engram_mem_session_start, engram_mem_session_summary
---

# Habilidad: Skill Lifecycle

## Objetivo
- Gestionar el ciclo de vida de una skill local del repo: crear, registrar, sincronizar y validar.
- Mantener consistencia entre `.agents/skills/`, `AGENTS.md` y las reglas operativas del proyecto.

## Cuando usar
- Crear una skill nueva porque aparece un patron reusable.
- Renombrar, fusionar o reestructurar una skill existente.
- Ajustar metadata, triggers, `allowed-tools` o descripcion.
- Registrar o sincronizar la skill en `AGENTS.md`.
- Validar referencias a MCP, skills globales y regla operativa de Notion.

## Cuando NO usar
- Exportar reglas a `.agent`, Cursor, Continue o Cline; eso pertenece a `setup-agent`.
- Hacer auditorias amplias del ecosistema de skills si no hay un cambio concreto de lifecycle.
- Resolver una tarea de producto que solo consume una skill existente.

## Flujo recomendado
1. Confirmar que la skill realmente debe existir o cambiar.
2. Definir nombre, alcance y trigger.
3. Crear o ajustar la estructura fisica de la skill.
4. Redactar o actualizar `SKILL.md` y assets asociados.
5. Registrar la skill en `AGENTS.md`.
6. Sincronizar metadata, auto-invocacion, MCP, skills globales y reglas del repo.
7. Verificar consistencia final y dejar trazabilidad si corresponde.

## Estructura esperada

```text
.agents/skills/{skill-name}/
|-- SKILL.md
|-- assets/
`-- references/
```

- `SKILL.md` es obligatorio.
- `assets/` guarda templates, ejemplos o material reusable.
- `references/` apunta a documentacion LOCAL del repo.

## Patrones criticos

### Naming y alcance
- Usar `kebab-case`.
- La descripcion debe explicar que hace la skill y cuando se dispara.
- Si la necesidad es transversal y versionada, mantener skill dedicada en vez de inflar otra ya existente.

### Contenido de la skill
- Empezar por reglas criticas y flujo de uso.
- Evitar duplicar documentacion larga; moverla a `references/` o `assets/`.
- No usar URLs web en `references/`; solo rutas locales.

### Sincronizacion del repo
- Verificar nombres, descripciones y rutas.
- Confirmar reglas de auto-invocacion en `AGENTS.md`.
- Aplicar el checklist comun de gobernanza en `docs/esenciales/guias/checklist-gobernanza-skills-agentes.md`.

## Checklist de lifecycle
- [ ] La skill no duplica una capability trivial o ya cubierta.
- [ ] El nombre sigue las convenciones del repo.
- [ ] El `frontmatter` esta completo.
- [ ] La descripcion incluye trigger claro.
- [ ] `SKILL.md` tiene alcance y reglas criticas legibles.
- [ ] `assets/` y `references/` se usan solo si agregan valor.
- [ ] `AGENTS.md` refleja la skill y su auto-invocacion.
- [ ] Las reglas MCP, Notion y skills globales siguen correctas.
- [ ] Si cambia el inventario exportado, luego ejecutar `setup-agent`.

## Decisiones rapidas

```text
Es un patron reusable y no trivial?         -> crear o actualizar skill
Solo hace falta una guia corta local?       -> usar references/
Necesita templates o ejemplos concretos?    -> usar assets/
El cambio afecta exports de otros agentes?  -> cerrar lifecycle y luego usar setup-agent
```

## Convenciones utiles

| Tipo | Patron | Ejemplos |
| --- | --- | --- |
| Skill generica | `{tecnologia}` | `pytest`, `playwright`, `typescript` |
| Skill de workflow | `{accion}-{objetivo}` | `skill-lifecycle`, `jira-task` |
| Skill de dominio repo | `{dominio}-{subdominio}` | `ops-docker`, `desarrollo-backend` |

## Recursos

- **Template**: `assets/SKILL-TEMPLATE.md`
- **Fuente de verdad del repo**: `AGENTS.md`
- **Checklist comun**: `docs/esenciales/guias/checklist-gobernanza-skills-agentes.md`
- **Exports de agentes**: ejecutar `setup-agent` despues de cambios que afecten workflows o commands exportados.

## Protocolo piloto de enrutamiento
- En la extension del piloto, `skill-lifecycle` lidera cuando el problema principal es crear, renombrar, fusionar, endurecer o registrar skills locales del repo.
- Si el cambio ya afecta exports a agentes secundarios, coordinar con `setup-agent` sin absorber la responsabilidad de exportacion.
- Si una tarea amplia mezcla governance de skills con implementacion de producto, quedar como skill de apoyo y entrar solo en la parte de lifecycle.

## Contrato minimo de handoff
- Al recibir o delegar un handoff, exigir: `objetivo`, `skill-lider`, `skill-destino`, `restricciones`, `archivos/rutas`, `defaults a evitar` y `salida esperada`.
- Si `skill-lifecycle` lidera, conserva la autoridad sobre alcance, metadata, triggers y registro coherente de la skill en `AGENTS.md`.
