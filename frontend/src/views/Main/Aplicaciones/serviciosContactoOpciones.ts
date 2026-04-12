import serviciosConfig from "./Servicios/Configuracion";

export interface OpcionServicioContacto {
  readonly value: string;
  readonly label: string;
}

/** Opciones para el selector del formulario de contacto (catálogo + fila vacía). */
export function getOpcionesInteresServicio(): readonly OpcionServicioContacto[] {
  const base: OpcionServicioContacto[] = [
    { value: "", label: "Selecciona un servicio (opcional)" },
  ];
  for (const cat of serviciosConfig.contenido.servicios) {
    for (const plan of cat.planes) {
      const label = `${cat.titulo} — ${plan.nombre}`;
      base.push({ value: label, label });
    }
  }
  return base;
}
