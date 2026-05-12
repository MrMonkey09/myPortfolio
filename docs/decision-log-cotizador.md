# Decision Log — Cotizador Web (Persistencia por Fases)

- **Estado:** Activo
- **Fecha inicial:** 2026-05-11
- **Relacionado con:**
  - `docs/rfc-cotizador-servicios-web.md` (RFC-001)
  - `docs/rfc-cotizador-servicios-web-contratos-datos-api.md` (RFC-002)
  - `docs/rfc-cotizador-servicios-web-ux-flujo-multipaso.md` (RFC-003)
  - `docs/rfc-004-benchmark-adjustments-governanza.md` (RFC-004)

---

## 1. Objetivo del decision log

Este documento fija decisiones de arquitectura por fase para evitar cambios implícitos durante implementación del cotizador.

En particular, define la estrategia de persistencia y sincronización comercial en entorno **cPanel-first (PHP/JS compatible)**.

---

## 2. Principios de decisión

1. **No romper operación comercial**: capturar leads siempre.
2. **Trazabilidad del cálculo**: preservar snapshot de parámetros y resultado.
3. **Evolución por fases**: priorizar velocidad en MVP y robustez en escalado.
4. **Backwards compatibility**: mantener transición controlada con flujo actual.

---

## 3. Fases y decisión de persistencia

## 3.1 Fase MVP

- **Objetivo de fase:** validar flujo rápida/avanzada/contacto y conversión.
- **Persistencia principal:** **Notion-first**.
- **Verdad de negocio:** Notion (transitoria en MVP).
- **Backend:** PHP compatible cPanel.

### Justificación

- Menor fricción de salida comercial.
- Time-to-market rápido.
- Equipo ya utiliza Notion en flujo actual.

### Riesgos aceptados

- Menor capacidad analítica y auditabilidad técnica fina.
- Dependencia de API externa.

### Criterios de salida de fase

- Flujo operativo estable.
- Métricas de conversión mínimas alcanzadas.
- Necesidad explícita de trazabilidad/versionado más robusto.

---

## 3.2 Fase Escalamiento

- **Objetivo de fase:** consolidar motor y trazabilidad técnica.
- **Persistencia principal:** **Híbrido (SQLite + Notion)**.
- **Verdad de negocio:** **SQLite**.
- **Proyección comercial:** Notion.

### Justificación

- Mantiene operación comercial simple mientras mejora rigor técnico.
- Habilita auditoría de cálculos, versionado y reportes internos.

### Reglas de sincronización

1. Se calcula y persiste primero en SQLite.
2. Se proyecta resumen y lead a Notion.
3. Si falla Notion, la cotización sigue válida en SQLite.
4. Reintentos de sync deben ser idempotentes.

### Riesgos aceptados

- Complejidad adicional por sincronización.
- Necesidad de observabilidad (estado de sync, reintentos, trazas).

### Criterios de salida de fase

- Sync estable y monitoreable.
- Trazabilidad de versiones confirmada.
- Carga operativa comercial sin fricción relevante.

---

## 3.3 Fase Operación Estable

- **Objetivo de fase:** operación madura, auditable y escalable.
- **Persistencia principal:** **SQLite-first consolidado**.
- **Verdad de negocio:** SQLite.
- **Notion:** opcional como vista comercial/CRM ligero.

### Justificación

- Máximo control de datos y consistencia histórica.
- Menor dependencia externa para lógica crítica.

### Riesgos aceptados

- Mayor disciplina operativa en backups/migraciones.
- Posible necesidad futura de evolucionar a motor de datos superior.

### Criterios de éxito de fase

- Recuperación de datos verificada.
- Reportes consistentes y auditables.
- Incidentes por inconsistencia de cotización ~0.

---

## 4. Matriz comparativa resumida

| Criterio | MVP | Escalamiento | Estable |
|---|---|---|---|
| Velocidad de salida | Alta | Media | Media |
| Trazabilidad técnica | Baja/Media | Alta | Alta |
| Dependencia externa | Alta | Media | Baja |
| Complejidad operativa | Baja | Media/Alta | Media |
| Recomendación | Notion-first | Híbrido | SQLite-first |

---

## 5. Regla de oro de consistencia

Cuando exista divergencia entre stores:

- En MVP: prevalece Notion (hasta migración formal).
- En escalamiento/estable: **prevalece SQLite** como fuente de verdad de cotización.

---

## 6. Checklist de transición entre fases

## MVP -> Escalamiento

- [x] Definir esquema SQLite de `QuoteRecord` v1.
- [x] Definir `pricing_config_version` persistente.
- [x] Implementar sync SQLite -> Notion.
- [x] Implementar observabilidad de sync (estado + reintentos + error code).

## Escalamiento -> Estable

- [ ] Validar restauración desde backups.
- [ ] Auditar paridad histórica de cotizaciones.
- [ ] Definir política de retención y archivado.
- [ ] Definir continuidad de Notion (obligatoria u opcional).

---

## 7. Decisiones abiertas (pendientes de cierre)

1. Política exacta de retención de datos por cotización.
2. Frecuencia y estrategia de backup en cPanel.
3. Nivel de detalle enviado a Notion en modo híbrido.
4. Umbral de métricas para gatillar transición de fase.

---

## 8. Registro de cambios

| Fecha | Cambio | Autor |
|---|---|---|
| 2026-05-11 | Versión inicial del decision log por fases de persistencia | Equipo A&V Devs / Mr Monkey |
