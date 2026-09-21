import { useEffect, useRef } from 'react';

const TIMEOUT_MS = 15 * 60 * 1000;
const EVENTOS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

// Cierra la sesión sola si no hay ninguna interacción del usuario durante
// 15 minutos, para no dejar historias clínicas abiertas en una pantalla
// desatendida.
export const useInactivityLogout = (onTimeout: () => void) => {
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => onTimeoutRef.current(), TIMEOUT_MS);
    };

    EVENTOS.forEach(evento => window.addEventListener(evento, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timer);
      EVENTOS.forEach(evento => window.removeEventListener(evento, resetTimer));
    };
  }, []);
};
