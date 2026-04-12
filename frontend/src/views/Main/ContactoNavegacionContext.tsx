/* eslint-disable react-refresh/only-export-components -- Provider y hook comparten contexto */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Aplicacion } from "../../types";

const ID_CONTACTO = "004";

export type ContactoNavegacionContextValue = Readonly<{
  aplicacionActual: Aplicacion;
  servicioInteresPreset: string;
  setAplicacionDesdeMenu: (app: Aplicacion) => void;
  irAContactoConServicio: (etiquetaPlanCompleta: string) => void;
}>;

const ContactoNavegacionContext =
  createContext<ContactoNavegacionContextValue | null>(null);

export function ContactoNavegacionProvider({
  children,
  aplicaciones,
}: Readonly<{
  children: ReactNode;
  aplicaciones: readonly Aplicacion[];
}>) {
  const [aplicacionActual, setAplicacionActual] = useState(aplicaciones[0]);
  const [servicioInteresPreset, setServicioInteresPreset] = useState("");

  const setAplicacionDesdeMenu = useCallback((app: Aplicacion) => {
    setServicioInteresPreset("");
    setAplicacionActual(app);
  }, []);

  const irAContactoConServicio = useCallback(
    (etiquetaPlanCompleta: string) => {
      setServicioInteresPreset(etiquetaPlanCompleta);
      const app = aplicaciones.find((a) => a.ID === ID_CONTACTO);
      if (app) setAplicacionActual(app);
    },
    [aplicaciones]
  );

  const value = useMemo(
    () => ({
      aplicacionActual,
      servicioInteresPreset,
      setAplicacionDesdeMenu,
      irAContactoConServicio,
    }),
    [
      aplicacionActual,
      servicioInteresPreset,
      setAplicacionDesdeMenu,
      irAContactoConServicio,
    ]
  );

  return (
    <ContactoNavegacionContext.Provider value={value}>
      {children}
    </ContactoNavegacionContext.Provider>
  );
}

export function useContactoNavegacion(): ContactoNavegacionContextValue {
  const ctx = useContext(ContactoNavegacionContext);
  if (!ctx) {
    throw new Error(
      "useContactoNavegacion debe usarse dentro de ContactoNavegacionProvider"
    );
  }
  return ctx;
}
