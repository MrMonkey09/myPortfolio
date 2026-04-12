import { useCallback, useEffect, useRef } from "react";
import type { Tarjeta } from "../../../../../types";
import "./CarruselDestacadas.css";

interface CarruselDestacadasProps {
  readonly tarjetas: readonly Tarjeta[];
}

const PX_POR_SEGUNDO = 52;

function CarruselDestacadas({
  tarjetas,
}: Readonly<CarruselDestacadasProps>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const segmentRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const segmentWidthRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const medirSegmento = useCallback(() => {
    segmentWidthRef.current = segmentRef.current?.offsetWidth ?? 0;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedMotionRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const seg = segmentRef.current;
    if (!seg) return;
    medirSegmento();
    const ro = new ResizeObserver(() => medirSegmento());
    ro.observe(seg);
    window.addEventListener("resize", medirSegmento);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", medirSegmento);
    };
  }, [tarjetas, medirSegmento]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (e: WheelEvent) => {
      if (!hoverRef.current) return;
      e.preventDefault();
      const w = segmentWidthRef.current;
      if (w <= 0) return;

      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      let next = viewport.scrollLeft + delta;
      if (next < 0) next += w;
      while (next >= w) next -= w;
      viewport.scrollLeft = next;
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [tarjetas]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.064);
      last = now;

      const w = segmentWidthRef.current;
      if (
        w > 0 &&
        !hoverRef.current &&
        !reducedMotionRef.current
      ) {
        viewport.scrollLeft += PX_POR_SEGUNDO * dt;
        if (viewport.scrollLeft >= w) {
          viewport.scrollLeft -= w;
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tarjetas]);

  const renderTarjeta = (t: Tarjeta, suffix: string) => (
    <article
      key={`${t.id}-${suffix}`}
      className="carrusel-destacadas__card"
    >
      <img src={t.imagen} alt={t.titulo} />
      <div className="carrusel-destacadas__body">
        <h2 className="carrusel-destacadas__titulo">{t.titulo}</h2>
        <span className="carrusel-destacadas__desc">{t.descripcion}</span>
      </div>
    </article>
  );

  return (
    <div
      className="carrusel-destacadas mask-horizontal"
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
    >
      <div
        ref={viewportRef}
        className="carrusel-destacadas__viewport"
        tabIndex={0}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Tarjetas destacadas, carrusel horizontal"
      >
        <div className="carrusel-destacadas__track">
          <div
            ref={segmentRef}
            className="carrusel-destacadas__segment carrusel-destacadas__segment--primera"
          >
            {tarjetas.map((t) => renderTarjeta(t, "a"))}
          </div>
          <div className="carrusel-destacadas__segment" aria-hidden="true">
            {tarjetas.map((t) => renderTarjeta(t, "b"))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarruselDestacadas;