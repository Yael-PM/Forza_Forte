/** Bloque de texto reutilizable para cada capítulo de la historia de la landing. */
import type { CSSProperties, ReactNode } from 'react';
import type { AlignDirection } from '../../types/story';

interface StoryBlockProps {
  label: string;
  title: string;
  accent?: string;
  align?: AlignDirection;
  children: ReactNode;
  style?: CSSProperties;
}

export function StoryBlock({
  label,
  title,
  accent,
  children,
  align = 'left',
  style,
}: StoryBlockProps) {
  const isRight = align === 'right';

  return (
    <div
      data-story-block
      className={`max-w-md ${isRight ? 'ml-auto text-right' : 'text-left'}`}
      style={style}
    >
      <p data-story-kicker className="font-body text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
        {label}
      </p>
      <h3
        data-story-title
        className="mt-4 font-luxury text-[clamp(1.9rem,3.3vw,3.1rem)] font-bold uppercase leading-[0.94] tracking-[0.14em] text-secondary"
      >
        {title}
        {accent && <span className="mt-2 block text-foreground/72">{accent}</span>}
      </h3>
      <div
        data-story-divider
        className={`mt-4 h-px w-16 bg-gradient-to-r from-primary to-transparent ${isRight ? 'ml-auto' : ''}`}
      />
      <div data-story-content className="mt-5 font-body text-[15px] leading-8 text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
