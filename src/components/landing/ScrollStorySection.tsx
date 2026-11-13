/** Historia de desplazamiento: sincroniza texto y prenda 3D con el scroll. */
import { useMemo, useRef } from 'react';
import StoryShirt3D, { type StoryShirt3DRef } from './StoryShirt3D';
import { StoryBlock } from './StoryBlock';
import { useScrollStory } from '../../hooks/useScrollStory';
import { STORY_SECTIONS, MOTION_STOPS } from '../../data/storyData';
import { clamp } from '../../utils/interpolation';

export default function ScrollStorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shirtRef = useRef<StoryShirt3DRef>(null);

  const { progress, activeIndex } = useScrollStory(
    containerRef,
    shirtRef,
    STORY_SECTIONS,
    MOTION_STOPS
  );

  const ringStyles = useMemo(
    () => [
      {
        transform: `rotate(${progress * 220}deg) scale(${0.86 + progress * 0.24})`,
        opacity: 0.12 + progress * 0.1,
      },
      {
        transform: `rotate(${-progress * 280}deg) scale(${0.98 + progress * 0.18})`,
        opacity: 0.1 + progress * 0.08,
      },
      {
        transform: `rotate(${progress * 180}deg) scale(${1.04 + progress * 0.14})`,
        opacity: 0.08 + progress * 0.06,
      },
    ],
    [progress]
  );

  return (
    <section ref={containerRef} id="story" className="relative bg-background">
      {/* Progress Dots Nav */}
      <div className="pointer-events-none sticky top-24 z-30 mx-auto hidden max-w-7xl px-8 lg:block">
        <div className="ml-auto flex w-fit items-center gap-2 rounded-full border border-white/8 bg-black/20 px-3 py-2 backdrop-blur-xl">
          {STORY_SECTIONS.map((section, index) => (
            <div
              key={section.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-10 bg-primary' : 'w-5 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative" style={{ height: `${STORY_SECTIONS.length * 100}vh` }}>
        {/* Canvas 3D Viewport Stickied */}
        <div className="sticky top-0 z-0 flex h-screen items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(106,194,208,0.12),transparent_24%)]"
            style={{ opacity: 0.32 + progress * 0.22 }}
          />
          <div className="absolute inset-0 grid-pattern opacity-15" />

          <div className="relative z-0 h-[58vh] w-full max-w-xl lg:h-[68vh] lg:max-w-2xl">
            <div
              className="absolute inset-[12%] rounded-full border border-primary/12 transition-transform duration-75"
              style={ringStyles[0]}
            />
            <div
              className="absolute inset-[4%] rounded-full border border-white/6 transition-transform duration-75"
              style={ringStyles[1]}
            />
            <div
              className="absolute inset-[20%] rounded-full border border-primary/8 transition-transform duration-75"
              style={ringStyles[2]}
            />
            <StoryShirt3D ref={shirtRef} />
            <div className="absolute bottom-8 left-1/2 h-28 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          </div>
        </div>

        {/* Story Text Sections */}
        {STORY_SECTIONS.map((section, idx) => {
          const local = clamp(1 - Math.abs(progress * (STORY_SECTIONS.length - 1) - idx), 0, 1);
          const offset = section.align === 'left' ? (1 - local) * -48 : (1 - local) * 48;

          return (
            <div
              key={section.id}
              className="absolute inset-x-0 z-20 flex h-screen items-center"
              style={{ top: `${idx * 100}vh` }}
            >
              <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 sm:px-8 lg:grid-cols-2 lg:px-12">
                {section.align === 'left' ? (
                  <>
                    <div className="relative z-20">
                      <StoryBlock
                        label={section.label}
                        title={section.title}
                        accent={section.accent}
                        align={section.align}
                        style={{
                          opacity: 0.18 + local * 0.82,
                          transform: `translate3d(${offset}px, ${(1 - local) * 30}px, 0) scale(${0.97 + local * 0.03})`,
                          filter: `blur(${(1 - local) * 4}px)`,
                          textShadow: '0 14px 40px rgba(0, 0, 0, 0.42)',
                        }}
                      >
                        {section.content}
                      </StoryBlock>
                    </div>
                    <div className="hidden lg:block" />
                  </>
                ) : (
                  <>
                    <div className="hidden lg:block" />
                    <div className="relative z-20">
                      <StoryBlock
                        label={section.label}
                        title={section.title}
                        accent={section.accent}
                        align={section.align}
                        style={{
                          opacity: 0.18 + local * 0.82,
                          transform: `translate3d(${offset}px, ${(1 - local) * 30}px, 0) scale(${0.97 + local * 0.03})`,
                          filter: `blur(${(1 - local) * 4}px)`,
                          textShadow: '0 14px 40px rgba(0, 0, 0, 0.42)',
                        }}
                      >
                        {section.content}
                      </StoryBlock>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
