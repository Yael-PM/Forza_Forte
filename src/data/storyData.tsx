/** Contenido y puntos de movimiento que alimentan la historia de la landing. */
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import type { StorySection, MotionStop } from '../types/story';

export const STORY_SECTIONS: StorySection[] = [
  {
    id: 'collections',
    label: '01 · COLECCIONES',
    title: 'HOMBRE',
    accent: '& MUJER',
    align: 'left',
    content: (
      <>
        <p data-story-item className="mb-3">
          Líneas pensadas para entrenamiento, presencia y movimiento. Siluetas deportivas limpias
          con una identidad visual firme desde el primer vistazo.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {['Colección hombre', 'Colección mujer', 'Ver colección'].map((item) => (
            <Link
              key={item}
              to="/collection"
              data-story-item
              className="inline-flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.22em] text-primary transition-colors hover:text-secondary"
            >
              <ChevronRight size={12} /> {item}
            </Link>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'technology',
    label: '02 · TECNOLOGÍA',
    title: 'TECNOLOGÍA',
    accent: 'CON DIRECCIÓN CLARA',
    align: 'right',
    content: (
      <>
        <p data-story-item className="mb-3">
          Visualización 3D, personalización en tiempo real y una experiencia enfocada en control.
          La innovación aquí acompaña al producto, no distrae del producto.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {['3D preview', 'Real-time design', 'Precision fit', 'Performance focus'].map((item) => (
            <div
              key={item}
              data-story-item
              className="rounded-full border border-white/8 px-3 py-2 font-body text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              {item}
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'materials',
    label: '03 · MATERIALES',
    title: 'MATERIALES',
    accent: 'PENSADOS PARA RENDIMIENTO REAL',
    align: 'left',
    content: (
      <>
        <p data-story-item className="mb-3">
          Telas ligeras, resistentes y elásticas. Acabados que refuerzan la identidad de marca sin
          saturar la prenda ni perder funcionalidad.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {['Poliéster técnico', 'Nylon premium', 'Bordado', 'DTF y sublimación'].map((item) => (
            <div
              key={item}
              data-story-item
              className="inline-flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {item}
            </div>
          ))}
        </div>
        <Link to="/materials" data-story-item className="luxury-button-secondary mt-6">
          Ver materiales y acabados
          <ArrowRight size={14} />
        </Link>
      </>
    ),
  },
  {
    id: 'forzalab',
    label: '04 · FORZALAB',
    title: 'PERSONALIZA',
    accent: 'TU PIEZA',
    align: 'right',
    content: (
      <>
        <p data-story-item className="mb-3">
          Define color, tela, impresión y composición visual desde una sola interfaz. ForzaLab te
          permite construir una pieza con una dirección más clara y profesional.
        </p>
        <Link to="/materials" data-story-item className="luxury-button mt-4">
          Explorar materiales
          <ArrowRight size={14} />
        </Link>
      </>
    ),
  },
  {
    id: 'questions',
    label: '05 · EXPERIENCIA',
    title: 'PREGUNTAS',
    accent: 'CLAVE',
    align: 'left',
    content: (
      <div className="space-y-3">
        {[
          [
            '¿Cómo funciona ForzaLab?',
            'Eliges prenda, color, tela y acabados; después personalizas y visualizas antes de guardar o pedir.',
          ],
          [
            '¿Deporte o moda?',
            'La base es deportiva, pero con una dirección visual premium y contemporánea.',
          ],
          [
            '¿Piezas únicas?',
            'Sí. El sistema está pensado para explorar combinaciones y propuestas con identidad propia.',
          ],
        ].map(([question, answer]) => (
          <div key={question} data-story-item className="border-l border-white/10 pl-4">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
              {question}
            </p>
            <p className="mt-2 font-body text-sm leading-7 text-muted-foreground">{answer}</p>
          </div>
        ))}
      </div>
    ),
  },
];

export const MOTION_STOPS: MotionStop[] = [
  // 01. Colecciones: Vista frontal sutilmente ladeada en Z para romper la simetría rígida
  { at: 0, rotationY: -0.65, rotationX: 0.05, rotationZ: -0.05, zoom: 1.35, focusY: 0.0 },

  // Transición dramática: Caída en picada (X) y rotación diagonal en Z mientras se aleja
  { at: 0.12, rotationY: -0.3, rotationX: -0.25, rotationZ: 0.15, zoom: 0.95, focusY: 0.05 },

  // 02. Tecnología: Súper impacto. Inclinada hacia adelante (X positivo) para meter el cuello bajo la cámara
  { at: 0.28, rotationY: 0.0, rotationX: 0.35, rotationZ: 0.0, zoom: 2.3, focusY: 0.22 },

  // Escape cinemático: La playera "esquiva" la cámara inclinándose drásticamente hacia atrás
  { at: 0.4, rotationY: 0.7, rotationX: -0.4, rotationZ: -0.2, zoom: 1.0, focusY: -0.05 },

  // 03. Materiales: Plano macro desde abajo (X negativo) mirando hacia el dobladillo inferior
  { at: 0.52, rotationY: 1.55, rotationX: -0.3, rotationZ: 0.1, zoom: 2.6, focusY: -0.35 },

  // Transición aérea: Giro inverso en Z simulando una pirueta de cámara flotante
  { at: 0.65, rotationY: 2.15, rotationX: 0.2, rotationZ: -0.3, zoom: 0.9, focusY: 0.0 },

  // 04. ForzaLab: Vista de tres cuartos trasera, inclinada hacia el frente para lucir los hombros
  { at: 0.78, rotationY: 2.85, rotationX: 0.25, rotationZ: 0.05, zoom: 1.95, focusY: 0.15 },

  // Transición de salida: Estabilización fluida
  { at: 0.88, rotationY: 3.5, rotationX: -0.1, rotationZ: -0.1, zoom: 1.1, focusY: 0.0 },

  // 05. Preguntas Clave: Plano estricto, imponente y perfectamente nivelado para el cierre
  { at: 1, rotationY: 4.25, rotationX: 0.05, rotationZ: 0.0, zoom: 1.7, focusY: 0.05 },
];
