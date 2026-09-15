import { useEffect, useRef, useState } from "react";

interface InteractiveFootballFieldProps {
  desktopImageSrc: string;
  mobileImageSrc: string;
  className?: string;
}

type Team = "local" | "visitante";

export default function InteractiveFootballField({
  desktopImageSrc,
  mobileImageSrc,
  className = "",
}: InteractiveFootballFieldProps) {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const goalLockedRef = useRef(false);

  const [score, setScore] = useState({
    local: 0,
    visitante: 0,
  });

  const [ballPosition, setBallPosition] = useState({
    x: 50,
    y: 50,
  });

  const [lastGoal, setLastGoal] = useState<Team | null>(null);

  useEffect(() => {
    const field = fieldRef.current;

    if (!field) return;

    function handlePointerDown(event: PointerEvent) {
      const rect = field!.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!isInside) return;

      // Mouse: ya funciona de forma libre.
      // Touch/pen: comienza el arrastre.
      if (event.pointerType !== "mouse") {
        draggingRef.current = true;
      }
    }

    function handlePointerUp() {
      draggingRef.current = false;
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = field!.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      /*
       * En desktop:
       * la pelota sigue al mouse mientras está sobre la cancha.
       *
       * En mobile:
       * la pelota solamente se mueve mientras mantenemos
       * el dedo presionado y arrastramos.
       */
      if (event.pointerType !== "mouse" && !draggingRef.current) {
        return;
      }

      if (!isInside) {
        return;
      }

      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      const normalizedX = Math.max(0, Math.min(100, x));
      const normalizedY = Math.max(0, Math.min(100, y));

      setBallPosition({
        x: normalizedX,
        y: normalizedY,
      });

      /*
       * DETECCIÓN DE GOLES
       *
       * Desktop:
       *   arco izquierdo  -> visitante
       *   arco derecho    -> local
       *
       * Mobile:
       *   arco superior   -> visitante
       *   arco inferior   -> local
       */

      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      if (isMobile) {
        /*
         * CANCHA VERTICAL
         *
         * El arco superior ocupa aproximadamente
         * el 0-10% de la altura.
         *
         * El arco inferior ocupa aproximadamente
         * el 90-100% de la altura.
         *
         * Limitamos el ancho al centro de la cancha.
         */

        const insideGoalX = normalizedX >= 38 && normalizedX <= 62;

        const topGoal = normalizedY <= 7 && insideGoalX;
        const bottomGoal = normalizedY >= 93 && insideGoalX;

        if (!topGoal && !bottomGoal) {
          goalLockedRef.current = false;
          setLastGoal(null);
          return;
        }

        if (goalLockedRef.current) {
          return;
        }

        goalLockedRef.current = true;

        if (topGoal) {
          // Gol para el visitante
          setScore((current) => ({
            ...current,
            visitante: current.visitante + 1,
          }));

          setLastGoal("visitante");
        }

        if (bottomGoal) {
          // Gol para el local
          setScore((current) => ({
            ...current,
            local: current.local + 1,
          }));

          setLastGoal("local");
        }

        return;
      }

      /*
       * CANCHA HORIZONTAL / DESKTOP
       */

      const insideGoalY = normalizedY >= 34 && normalizedY <= 66;

      const leftGoal = normalizedX <= 7 && insideGoalY;
      const rightGoal = normalizedX >= 93 && insideGoalY;

      if (!leftGoal && !rightGoal) {
        goalLockedRef.current = false;
        setLastGoal(null);
        return;
      }

      if (goalLockedRef.current) {
        return;
      }

      goalLockedRef.current = true;

      if (leftGoal) {
        // Gol para el visitante
        setScore((current) => ({
          ...current,
          visitante: current.visitante + 1,
        }));

        setLastGoal("visitante");
      }

      if (rightGoal) {
        // Gol para el local
        setScore((current) => ({
          ...current,
          local: current.local + 1,
        }));

        setLastGoal("local");
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  return (
    <div
      ref={fieldRef}
      className={`relative isolate h-full w-full overflow-hidden bg-black ${className}`}
      style={{
        touchAction: isMobile ? "none" : "auto",
      }}
    >
      {/* CANCHA */}
      <picture className="absolute inset-0 block h-full w-full">
        <source
          media="(max-width: 767px)"
          srcSet={mobileImageSrc}
        />

        <img
          src={desktopImageSrc}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover grayscale contrast-125"
        />
      </picture>

      {/* CAPA BLANCO Y NEGRO */}
      <div className="pointer-events-none absolute inset-0 bg-black/20 mix-blend-multiply" />

      {/* MARCADOR */}
      <div className="pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2">
        
      </div>

      {/* ZONAS DE GOL DESKTOP */}
      <div
        className={`pointer-events-none absolute left-0 top-[34%] z-10 hidden h-[32%] w-[7%] border-y border-r transition md:block ${
          lastGoal === "visitante"
            ? "border-white bg-white/20"
            : "border-transparent"
        }`}
      />

      <div
        className={`pointer-events-none absolute right-0 top-[34%] z-10 hidden h-[32%] w-[7%] border-y border-l transition md:block ${
          lastGoal === "local"
            ? "border-white bg-white/20"
            : "border-transparent"
        }`}
      />

      {/* ZONAS DE GOL MOBILE */}
      <div
        className={`pointer-events-none absolute left-[38%] top-0 z-10 block h-[7%] w-[24%] border-x border-b transition md:hidden ${
          lastGoal === "visitante"
            ? "border-white bg-white/20"
            : "border-transparent"
        }`}
      />

      <div
        className={`pointer-events-none absolute bottom-0 left-[38%] z-10 block h-[7%] w-[24%] border-x border-t transition md:hidden ${
          lastGoal === "local"
            ? "border-white bg-white/20"
            : "border-transparent"
        }`}
      />

      {/* PELOTA */}
      <div
        className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${ballPosition.x}%`,
          top: `${ballPosition.y}%`,
          transition: "none",
        }}
      >
        {/* SOMBRA */}
        <div className="absolute left-1/2 top-[80%] h-2 w-7 -translate-x-1/2 rounded-full bg-black/50 blur-[4px]" />

        {/* PELOTA */}
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black bg-white text-[22px] leading-none shadow-[0_4px_12px_rgba(0,0,0,.45)] sm:h-10 sm:w-10 sm:text-[24px]">
          ⚽
        </div>
      </div>

      {/* TEXTO DE AYUDA */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
        <div className="flex items-center gap-4 rounded-full border border-white/30 bg-black/75 px-5 py-2.5 text-white backdrop-blur-md">
          <span className="text-xs font-medium uppercase tracking-[0.18em]">
            Local
          </span>

          <span className="text-2xl font-semibold tabular-nums">
            {score.local}
          </span>

          <span className="text-white/50">-</span>

          <span className="text-2xl font-semibold tabular-nums">
            {score.visitante}
          </span>

          <span className="text-xs font-medium uppercase tracking-[0.18em]">
            Visitante
          </span>
        </div>
      </div>
    </div>
  );
}