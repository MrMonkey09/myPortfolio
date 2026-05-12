import { useEffect, useRef } from "react";
import "./MatrixRain.css";

/** Mezcla latina + katakana halfwidth (estética Matrix, legible en monospace). */
const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ<>/\\|;:!@#$%^&*";

function pickChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)] ?? "0";
}

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduce = () => {
      reducedRef.current = mq.matches;
    };
    syncReduce();

    let raf = 0;
    let width = 0;
    let height = 0;
    let fontSize = 14;
    let columns = 0;
    /** Posición Y en píxeles (cabeza de cada columna). */
    let dropsY: number[] = [];
    /** Carácter visible por columna (evita parpadeo cada frame). */
    let columnChars: string[] = [];

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fontSize =
        width < 480 ? 11 : width < 768 ? 13 : width < 1200 ? 14 : 15;
      columns = Math.max(8, Math.ceil(width / fontSize));
      dropsY = Array.from({ length: columns }, () => Math.random() * -height);
      columnChars = Array.from({ length: columns }, () => pickChar());
      ctx.font = `600 ${fontSize}px "Courier New", Courier, monospace`;
      ctx.textBaseline = "top";
    }

    function paintStatic() {
      layout();
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, width, height);
    }

    function frame() {
      if (reducedRef.current) return;

      ctx.fillStyle = "rgba(13, 13, 13, 0.14)";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < columns; i++) {
        const x = i * fontSize;
        const y = dropsY[i] ?? 0;

        if (Math.random() > 0.965) {
          columnChars[i] = pickChar();
        }

        const char = columnChars[i] ?? "0";
        const isHead = Math.random() > 0.82;

        if (isHead) {
          ctx.shadowColor = "#74ff4e";
          ctx.shadowBlur = 10;
          ctx.fillStyle = "#c8ffc0";
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(116, 255, 78, 0.62)";
        }

        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        const step = fontSize * (0.42 + Math.random() * 0.38);
        dropsY[i] = y + step;

        if (y > height + fontSize * 4 && Math.random() > 0.975) {
          dropsY[i] = Math.random() * -fontSize * 24;
          columnChars[i] = pickChar();
        }
      }

      raf = requestAnimationFrame(frame);
    }

    function restart() {
      cancelAnimationFrame(raf);
      syncReduce();
      if (reducedRef.current) {
        paintStatic();
        return;
      }
      layout();
      raf = requestAnimationFrame(frame);
    }

    restart();
    mq.addEventListener("change", restart);
    window.addEventListener("resize", restart);

    return () => {
      mq.removeEventListener("change", restart);
      window.removeEventListener("resize", restart);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="matrix-rain-canvas" aria-hidden />
      <div className="matrix-rain-overlay" aria-hidden />
    </>
  );
}

export default MatrixRain;
