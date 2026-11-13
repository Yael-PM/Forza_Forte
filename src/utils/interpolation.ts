/** Funciones para limitar valores e interpolar el movimiento durante el scroll. */
import type { MotionStop } from '../types/story';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

export function sampleStops(stops: MotionStop[], progress: number): MotionStop {
  const bounded = clamp(progress, 0, 1);
  
  for (let i = 0; i < stops.length - 1; i += 1) {
    const current = stops[i];
    const next = stops[i + 1];
    if (bounded >= current.at && bounded <= next.at) {
      const local = (bounded - current.at) / (next.at - current.at || 1);
      return {
        at: bounded,
        rotationY: lerp(current.rotationY, next.rotationY, local),
        rotationX: lerp(current.rotationX, next.rotationX, local),
        rotationZ: lerp(current.rotationZ, next.rotationZ, local),
        zoom: lerp(current.zoom, next.zoom, local),
        focusY: lerp(current.focusY, next.focusY, local),
      };
    }
  }
  return stops[stops.length - 1];
}
