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
import type { QuoteHandoffContext } from "../../types";

const ID_CONTACTO = "004";

export type ContactoNavegacionContextValue = Readonly<{
  aplicacionActual: Aplicacion;
  servicioInteresPreset: string;
  quoteHandoffContext: QuoteHandoffContext | null;
  avanzadaHandoffContext: QuoteHandoffContext | null;
  setAplicacionDesdeMenu: (app: Aplicacion) => void;
  irAContactoConServicio: (etiquetaPlanCompleta: string) => void;
  irAContactoConContexto: (
    etiquetaPlanCompleta: string,
    contexto: QuoteHandoffContext | null,
  ) => void;
  prepararHandoffAvanzada: (contexto: QuoteHandoffContext) => void;
  limpiarHandoffAvanzada: () => void;
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
  const [quoteHandoffContext, setQuoteHandoffContext] =
    useState<QuoteHandoffContext | null>(null);
  const [avanzadaHandoffContext, setAvanzadaHandoffContext] =
    useState<QuoteHandoffContext | null>(null);

  const setAplicacionDesdeMenu = useCallback((app: Aplicacion) => {
    setServicioInteresPreset("");
    setQuoteHandoffContext(null);
    setAplicacionActual(app);
  }, []);

  const irAContactoConServicio = useCallback(
    (etiquetaPlanCompleta: string) => {
      setServicioInteresPreset(etiquetaPlanCompleta);
      setQuoteHandoffContext(null);
      const app = aplicaciones.find((a) => a.ID === ID_CONTACTO);
      if (app) setAplicacionActual(app);
    },
    [aplicaciones]
  );

  const irAContactoConContexto = useCallback(
    (etiquetaPlanCompleta: string, contexto: QuoteHandoffContext | null) => {
      setServicioInteresPreset(etiquetaPlanCompleta);
      setQuoteHandoffContext(contexto);
      const app = aplicaciones.find((a) => a.ID === ID_CONTACTO);
      if (app) setAplicacionActual(app);
    },
    [aplicaciones],
  );

  const prepararHandoffAvanzada = useCallback((contexto: QuoteHandoffContext) => {
    setAvanzadaHandoffContext(contexto);
  }, []);

  const limpiarHandoffAvanzada = useCallback(() => {
    setAvanzadaHandoffContext(null);
  }, []);

  const value = useMemo(
    () => ({
      aplicacionActual,
      servicioInteresPreset,
      quoteHandoffContext,
      avanzadaHandoffContext,
      setAplicacionDesdeMenu,
      irAContactoConServicio,
      irAContactoConContexto,
      prepararHandoffAvanzada,
      limpiarHandoffAvanzada,
    }),
    [
      aplicacionActual,
      servicioInteresPreset,
      quoteHandoffContext,
      avanzadaHandoffContext,
      setAplicacionDesdeMenu,
      irAContactoConServicio,
      irAContactoConContexto,
      prepararHandoffAvanzada,
      limpiarHandoffAvanzada,
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
