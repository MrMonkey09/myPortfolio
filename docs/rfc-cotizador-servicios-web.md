# RFC-001 — Cotizador Web de Servicios (Avanzado + Rápido + Contacto)

- **Estado:** Propuesto
- **Fecha:** 2026-05-11
- **Autores:** Equipo A&V Devs / Mr Monkey
- **Repositorio:** `myPortfolio`
- **Ámbito:** Frontend + backend de contacto + modelo de cotización

---

## 1. Resumen ejecutivo

Este RFC define la arquitectura funcional y técnica para incorporar en el portfolio un **cotizador web de servicios** con tres caminos de entrada:

1. **Cotización avanzada** (detalle por módulos, complejidad y factores comerciales).
2. **Cotización rápida** (simulación orientativa con menor fricción).
3. **Contacto directo** (flujo actual, sin cotización).

La decisión central es construir un **único motor de reglas de cotización** (dominio compartido) reutilizado por ambos modos (avanzado y rápido), manteniendo contacto directo como alternativa permanente.

---

## 2. Problema y contexto

Hoy la sección de servicios permite seleccionar un plan y derivar a un formulario de contacto. Ese flujo sirve para captar leads, pero no modela el sistema de cotización profesional definido en:

- `plantilla_madre_cotizaciones_web.xlsx`
- `manual_plantilla_madre_cotizaciones_web.md`

El sistema de plantilla incluye diagnóstico, selección modular, complejidad, horas, factores comerciales, riesgo, margen, impuestos y servicios mensuales. En web, esas reglas aún no existen como dominio operativo.

---

## 3. Objetivos

## 3.1 Objetivos principales

- Llevar el modelo Excel/manual a una experiencia web consistente.
- Permitir simulación de cotización en dos niveles (rápido y avanzado).
- Mantener contacto directo como salida de baja fricción.
- Preservar trazabilidad comercial y explicabilidad del cálculo.

## 3.2 Objetivos de calidad

- **Paridad de reglas:** consistencia entre resultado web y reglas del modelo base.
- **Separación de capas:** cálculo desacoplado de componentes UI.
- **Escalabilidad:** catálogo y parámetros actualizables sin reescribir toda la interfaz.

## 3.3 Fuera de alcance (este RFC)

- Integración con pasarelas de pago para cobro.
- Firma de contrato digital.
- Facturación electrónica.
- Automatización completa de propuesta PDF legal final.

---

## 4. Principios de diseño

1. **Dominio primero:** el motor de cotización no depende de componentes visuales.
2. **Un motor, múltiples entradas:** rápida y avanzada comparten reglas.
3. **Explicabilidad comercial:** cada total debe poder justificarse por desglose.
4. **Separación proyecto vs mensualidad:** regla obligatoria del sistema.
5. **Gobierno de parámetros:** cambios de tarifa/factores deben ser controlados.

---

## 5. Requerimientos funcionales

## 5.1 RF-01 — Modo Avanzado

El sistema debe permitir:

- Capturar contexto de cliente/proyecto.
- Seleccionar módulos del catálogo.
- Definir cantidad y complejidad por módulo.
- Aplicar factores comerciales (urgencia, remodelación, contingencia, margen, descuento, IVA).
- Mostrar resumen técnico-comercial con desglose.

## 5.2 RF-02 — Modo Rápido

El sistema debe permitir:

- Capturar variables mínimas de entrada.
- Ejecutar una simulación orientativa.
- Mostrar resultado resumido y límites de interpretación.
- Derivar a modo avanzado o contacto directo.

## 5.3 RF-03 — Contacto directo

El sistema debe mantener el flujo actual para usuarios que no desean cotizar en ese momento.

## 5.4 RF-04 — Resultado comercial

Cada simulación debe producir salida estructurada con:

- Total proyecto.
- Total mensual opcional.
- Supuestos aplicados.
- Exclusiones/condiciones base.

---

## 6. Requerimientos no funcionales

- **RNF-01 Consistencia:** inputs equivalentes deben generar resultados equivalentes.
- **RNF-02 Mantenibilidad:** reglas de cálculo encapsuladas y testeables.
- **RNF-03 Auditabilidad:** conservar snapshot de parámetros utilizados por simulación.
- **RNF-04 UX:** flujo entendible para usuarios técnicos y no técnicos.

---

## 7. Arquitectura propuesta

## 7.1 Vista de alto nivel

```mermaid
flowchart TD
    A[Servicios: Consultar plan] --> B{Elegir modo}
    B --> C[Avanzado]
    B --> D[Rápido]
    B --> E[Contacto directo]

    C --> F[Orquestador de flujo]
    D --> F
    F --> G[Motor de cotización (dominio)]
    G --> H[Resumen y desglose]
    H --> I[Contacto / CRM]

    E --> I
```

## 7.2 Capas

| Capa | Responsabilidad |
|---|---|
| Presentación | Formularios, pasos, visualización de resultados |
| Aplicación | Orquestar flujo, validaciones de navegación, mapping UI->dominio |
| Dominio | Reglas de cálculo y políticas de inclusión/exclusión |
| Infraestructura | Persistencia, integraciones (contacto/Notion), carga de config |

---

## 8. Modelo de dominio

## 8.1 Entidades

| Entidad | Propósito |
|---|---|
| `QuoteRequest` | Contexto del cliente y del proyecto |
| `PricingConfig` | Parámetros comerciales versionados |
| `ModuleCatalogItem` | Biblioteca de módulos con horas por complejidad |
| `QuoteLineItem` | Línea seleccionada para cálculo |
| `QuoteCalculation` | Resultado numérico del motor |
| `MonthlyServiceSelection` | Servicios recurrentes opcionales |
| `QuoteSummary` | Salida ejecutiva para cliente/comercial |

## 8.2 Reglas de cálculo (contrato)

```text
horas_unitarias = lookup(modulo, complejidad)
horas_base = cantidad * horas_unitarias
horas_ajustadas = horas_base * factor_proyecto
costo_base = horas_ajustadas * tarifa_hora_base
costo_directo = suma(costo_base)
contingencia = costo_directo * %contingencia
subtotal_contingencia = costo_directo + contingencia
margen = subtotal_contingencia * %margen
subtotal_neto = subtotal_contingencia + margen
descuento = subtotal_neto * %descuento
total_neto = subtotal_neto - descuento
iva = aplicar_iva ? total_neto * %iva : 0
total_final = total_neto + iva
```

### Regla crítica heredada

Solo se suman líneas marcadas con **Incluir = "Sí"**.

---

## 9. Diseño de flujos UX

## 9.1 Modo Avanzado (multipaso)

1. Contexto del proyecto
2. Requerimientos y alcance
3. Selección de módulos
4. Ajustes comerciales
5. Resultado detallado
6. Derivación comercial (contacto)

## 9.2 Modo Rápido

1. Preguntas mínimas
2. Simulación orientativa
3. Opciones: profundizar (avanzado) o contactar

## 9.3 Contacto directo

Continuidad del flujo actual, con contexto precargado cuando exista.

---

## 10. Datos, persistencia y trazabilidad

## 10.1 Reglas de datos

- Cada simulación debe registrar su `pricing_config_version`.
- Debe almacenarse snapshot de catálogo/parámetros usados.
- Debe guardarse origen de la simulación (`avanzada`, `rápida`, `directo`).

## 10.2 Reglas comerciales mínimas

- Separar proyecto inicial vs mensualidad.
- Incluir condiciones de vigencia y exclusiones base.
- Capturar supuestos que afectan plazo/precio.

---

## 11. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Divergencia con Excel/manual | Alto | Contrato de reglas + casos patrón de paridad |
| UX compleja en modo avanzado | Medio | Flujo guiado + resumen por pasos |
| Pérdida de margen por parámetros mal calibrados | Alto | Gobernanza de configuración |
| Ambigüedad comercial/legal | Alto | Sección obligatoria de exclusiones y condiciones |
| Cambios de alcance no controlados | Alto | Versionado de cotizaciones |

---

## 12. ADRs (Architecture Decision Records)

## ADR-001 — Un único motor de cotización

- **Decisión:** rápida y avanzada comparten el mismo núcleo de cálculo.
- **Motivo:** evita duplicación de lógica y divergencia de resultados.
- **Consecuencia:** el modo rápido no implementa reglas paralelas, solo simplifica inputs.

## ADR-002 — Contacto directo permanece como camino oficial

- **Decisión:** mantener flujo de contacto como tercera vía estable.
- **Motivo:** reduce fricción y preserva conversiones cuando el usuario no quiere simular.
- **Consecuencia:** coexistencia de dos niveles de madurez comercial (lead simple y pre-cotización).

## ADR-003 — Configuración de pricing versionada

- **Decisión:** toda simulación referencia versión de parámetros.
- **Motivo:** trazabilidad y auditoría comercial.
- **Consecuencia:** al cambiar configuración, resultados históricos no se recalculan retroactivamente.

---

## 13. Plan de trabajo (tareas macro)

> Nota: Esta sección define **qué** hay que hacer y **por qué**, sin detallar ejecución técnica fina.

## Fase A — Alineación de dominio

- [ ] Definir contrato formal de cálculo (paridad con sistema base).
- [ ] Definir diccionario de entidades y campos.
- [ ] Definir reglas obligatorias de negocio (inclusión, exclusiones, mensualidad, IVA).

## Fase B — Núcleo del motor

- [ ] Modelar entidades de dominio de cotización.
- [ ] Implementar módulo de cálculo desacoplado de UI.
- [ ] Definir validaciones de entrada y errores de dominio.

## Fase C — Flujo Avanzado

- [ ] Diseñar experiencia multipaso de detalle.
- [ ] Integrar selección modular + factores comerciales.
- [ ] Exponer resumen detallado y supuestos.

## Fase D — Flujo Rápido

- [ ] Definir cuestionario mínimo.
- [ ] Mapear respuestas a reglas compartidas.
- [ ] Entregar resultado orientativo con disclaimers.

## Fase E — Integración comercial

- [ ] Unificar salida de simulación a contacto/CRM.
- [ ] Persistir snapshot de parámetros y resultado.
- [ ] Incluir condiciones comerciales base en salida.

## Fase F — Calidad y gobierno

- [ ] Definir suite de casos patrón de paridad.
- [ ] Definir mantenimiento de catálogo/configuración.
- [ ] Definir criterios de aceptación comercial y técnica.

---

## 14. Criterios de aceptación del RFC

- [ ] Existe acuerdo sobre entidades y contrato de cálculo.
- [ ] Existe acuerdo sobre los 3 flujos (avanzado/rápido/directo).
- [ ] Existe acuerdo sobre trazabilidad y versionado de parámetros.
- [ ] Existe acuerdo sobre reglas comerciales mínimas visibles al usuario.

---

## 15. Preguntas abiertas

1. ¿Qué nivel de detalle del desglose se mostrará al cliente final?
2. ¿Dónde vivirá la fuente editable de catálogo y parámetros?
3. ¿El modo rápido devuelve total único o rango estimado?
4. ¿Qué campos de simulación deben enviarse a Notion obligatoriamente?
5. ¿Cómo se gestionará la aprobación interna de cambios de pricing?

---

## 16. Próximo paso recomendado

Una vez aprobado este RFC, crear documento técnico complementario de **esquema de datos y contratos de API** para asegurar que frontend, backend y capa comercial hablen el mismo idioma desde el inicio.
