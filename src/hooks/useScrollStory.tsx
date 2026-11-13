/** Hook que calcula el progreso del scroll y controla animaciones y movimiento 3D. */
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { animate, createScope, createTimeline, splitText, spring, stagger, utils } from 'animejs';
import type { MotionStop, StorySection } from '../types/story';
import { clamp, sampleStops } from '../utils/interpolation';

interface ShirtRef {
  setMotion: (ry: number, rx: number, rz: number, zoom: number, focusY: number) => void;
}

interface SplitEntry {
  split: ReturnType<typeof splitText>;
  divider: Element | null;
  kicker: Element | null;
  items: Element[];
}

export function useScrollStory(
  containerRef: RefObject<HTMLElement | null>,
  shirtRef: RefObject<ShirtRef | null>,
  sections: StorySection[],
  motionStops: MotionStop[]
) {
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const rafRef = useRef<number>(0);
  const splitsRef = useRef<SplitEntry[]>([]);

  // Inicialización de AnimeJS Scope y SplitText
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const scope = createScope({ root });
    scope.add(() => {
      const blocks = Array.from(root.querySelectorAll('[data-story-block]'));

      splitsRef.current = blocks.map((block) => {
        const title = block.querySelector('[data-story-title]');
        const divider = block.querySelector('[data-story-divider]');
        const kicker = block.querySelector('[data-story-kicker]');
        const items = Array.from(block.querySelectorAll('[data-story-item]'));
        if (!title) return null;
        const split = splitText(title, { chars: { class: 'story-char', wrap: 'clip' } });

        utils.set(split.chars, { y: '115%', opacity: 0, rotateZ: '5deg' });
        if (divider) utils.set(divider, { scaleX: 0, opacity: 0, transformOrigin: 'left center' });
        if (kicker) utils.set(kicker, { opacity: 0, y: '-0.5rem' });
        utils.set(items, { opacity: 0, y: '1.4rem' });

        return { split, divider, kicker, items };
      }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

      return () => {
        splitsRef.current.forEach((entry) => entry.split.revert());
      };
    });

    return () => scope.revert();
  }, [containerRef]);

  // Manejo de animaciones cuando cambia activeIndex
  useEffect(() => {
    const entries = splitsRef.current;
    if (!entries.length) return;

    entries.forEach((entry, index) => {
      const isActive = index === activeIndex;
      
      if (entry.kicker) animate(entry.kicker, {
        opacity: isActive ? 1 : 0.28,
        y: isActive ? '0rem' : '-0.3rem',
        duration: 420,
        ease: 'outQuad',
      });

      if (entry.divider) animate(entry.divider, {
        scaleX: isActive ? 1 : 0.35,
        opacity: isActive ? 1 : 0.24,
        duration: 520,
        ease: 'outExpo',
      });

      animate(entry.items, {
        opacity: isActive ? 1 : 0,
        y: isActive ? '0rem' : '1rem',
        delay: isActive ? stagger(65, { start: 120 }) : 0,
        duration: 520,
        ease: isActive ? spring({ stiffness: 220, damping: 18 }) : 'outQuad',
      });

      if (isActive) {
        createTimeline({
          defaults: { ease: spring({ stiffness: 240, damping: 18 }) },
        }).add(entry.split.chars, {
          y: ['115%', '0%'],
          opacity: [0, 1],
          rotateZ: ['5deg', '0deg'],
          delay: stagger(16),
          duration: 920,
        });
      } else {
        animate(entry.split.chars, {
          y: '105%',
          opacity: 0,
          rotateZ: '4deg',
          duration: 260,
          ease: 'outQuad',
        });
      }
    });
  }, [activeIndex]);

  // Listener de Scroll
  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const root = containerRef.current;
        if (!root) return;

        const rect = root.getBoundingClientRect();
        const total = Math.max(rect.height - window.innerHeight, 1);
        const scrolled = clamp(-rect.top, 0, total);
        const nextProgress = scrolled / total;
        const nextIndex = Math.round(nextProgress * (sections.length - 1));
        const motion = sampleStops(motionStops, nextProgress);

        setProgress(nextProgress);
        setActiveIndex(nextIndex);
        
        shirtRef.current?.setMotion(
          motion.rotationY,
          motion.rotationX,
          motion.rotationZ,
          motion.zoom,
          motion.focusY
        );
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [containerRef, shirtRef, sections.length, motionStops]);

  return { progress, activeIndex };
}
