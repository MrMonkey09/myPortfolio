import { useCallback, useEffect, useRef, useState } from "react";
import "./CursorPersonalizado.css";

type CursorState = "default" | "hover" | "scroll" | "click";

function CursorPersonalizado() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("default");
  const positionRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const isTouchDevice = useRef(false);

  // Detectar dispositivo táctil
  useEffect(() => {
    isTouchDevice.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice.current) {
      return;
    }
  }, []);

  // Trackear movimiento del mouse
  useEffect(() => {
    if (isTouchDevice.current) return;

    const onMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      const cursor = cursorRef.current;
      if (cursor) {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseleave", onMouseLeave);
    document.body.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.body.removeEventListener("mouseleave", onMouseLeave);
      document.body.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  // Detectar elementos interactivos para cambiar estado
  useEffect(() => {
    if (isTouchDevice.current) return;

    const getCursorState = (element: Element | null): CursorState => {
      if (!element) return "default";

      const tagName = element.tagName.toLowerCase();
      const computedStyle = window.getComputedStyle(element);
      const cursor = computedStyle.cursor;

      // Elementos clickeables
      const isInteractive =
        tagName === "a" ||
        tagName === "button" ||
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        element.getAttribute("role") === "button" ||
        element.getAttribute("contenteditable") === "true" ||
        cursor === "pointer";

      if (isInteractive) return "hover";

      // Elementos scrolleables
      const isScrollable =
        cursor === "grab" ||
        cursor === "grabbing" ||
        computedStyle.overflowX === "auto" ||
        computedStyle.overflowX === "scroll" ||
        computedStyle.overflowY === "auto" ||
        computedStyle.overflowY === "scroll" ||
        tagName === "details";

      if (isScrollable) return "scroll";

      return "default";
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const newState = getCursorState(target);
      setState((prev) => (prev !== "click" ? newState : prev));
    };

    const onMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as Element;
      if (!related) {
        setState("default");
        return;
      }
      const newState = getCursorState(related);
      setState(newState);
    };

    const onMouseDown = () => setState("click");
    const onMouseUp = (e: MouseEvent) => {
      const target = e.target as Element;
      const newState = getCursorState(target);
      setState(newState);
    };

    // Agregar listener al document para capturar todo
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Si es dispositivo táctil, no renderizar
  if (isTouchDevice.current) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className={`cursor-personalizado cursor-personalizado--${state} ${
        isVisible ? "visible" : ""
      }`}
      style={{
        left: 0,
        top: 0,
      }}
      aria-hidden="true"
    >
      <svg
        className="cursor__icono"
        viewBox="0 0 32 32"
        width="32"
        height="32"
      >
        {/* Default: Crosshair con animación de scan */}
        <g className="cursor__crosshair">
          <circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="2" x2="16" y2="10" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="22" x2="16" y2="30" stroke="currentColor" strokeWidth="2" />
          <line x1="2" y1="16" x2="10" y2="16" stroke="currentColor" strokeWidth="2" />
          <line x1="22" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="2" />
        </g>

        {/* Hover: Circle pequeño con pulse */}
        <g className="cursor__hover">
          <circle cx="16" cy="16" r="5" fill="currentColor" />
          <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" className="cursor__pulse" />
        </g>

        {/* Scroll: Flechas de scroll con movimiento */}
        <g className="cursor__scroll">
          <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <polyline points="10,12 16,18 22,12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="10,20 16,26 22,20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Click: Circle con scale */}
        <g className="cursor__click">
          <circle cx="16" cy="16" r="6" fill="currentColor" />
        </g>
      </svg>

      {/* Trail effect para movimiento */}
      <div className="cursor__trail" />
    </div>
  );
}

export default CursorPersonalizado;