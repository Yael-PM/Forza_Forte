/** Tipos compartidos para capítulos de la historia y posiciones del modelo 3D. */
import type { ReactNode } from 'react';

export type AlignDirection = 'left' | 'right';

export interface StorySection {
  id: string;
  label: string;
  title: string;
  accent?: string;
  align: AlignDirection;
  content: ReactNode;
}

export interface MotionStop {
  at: number; // Progress from 0 to 1
  rotationY: number;
  rotationX: number;
  rotationZ: number;
  zoom: number;
  focusY: number;
}
