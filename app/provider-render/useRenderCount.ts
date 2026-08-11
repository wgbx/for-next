import { useRef } from "react";

export function useRenderCount(): number {
  const renderCount = useRef(0);
  // Deliberate render-phase ref mutation: this is a debug-only counter for the
  // provider-render demo and must increment on every render, including
  // "wasted" re-renders with unchanged deps (the exact thing being
  // demonstrated). No concurrent/Suspense/transition rendering is in play
  // here, so a discarded in-progress render double-counting the ref is not a
  // real risk in this demo.
  // eslint-disable-next-line react-hooks/refs -- see comment above
  renderCount.current += 1;
  // eslint-disable-next-line react-hooks/refs -- see comment above
  return renderCount.current;
}
