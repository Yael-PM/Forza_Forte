/** Flujo de diseño por etapas: género, estilo, prenda y selección de prenda base. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import forzaForteLogo from '../assets/forza-forte-logo.png';
import shirtModelUrl from '../assets/forza-forte-shirt.glb';
import pantsModelUrl from '../assets/forza-forte-pants.glb';

type Gender = 'male' | 'female' | 'unisex';
type Style = 'streetwear' | 'fit';
type GarmentType = 'tshirt' | 'pants';

interface BaseGarment {
  id: string;
  name: string;
  fabric: string;
  weight: number;
  description: string;
  color: string;
}

const BASE_GARMENTS: Record<GarmentType, BaseGarment[]> = {
  tshirt: [
    { id: 'tee-poly', name: 'Playera técnica ligera', fabric: 'Poliéster técnico', weight: 150, description: 'Tejido ligero para entrenamiento y actividad diaria.', color: '#243238' },
    { id: 'tee-jersey', name: 'Playera jersey performance', fabric: 'Jersey deportivo', weight: 185, description: 'Balance entre estructura, comodidad y rendimiento.', color: '#172a45' },
    { id: 'tee-nylon', name: 'Playera stretch premium', fabric: 'Nylon con elastano', weight: 210, description: 'Mayor elasticidad y resistencia para movimiento intenso.', color: '#31283a' },
  ],
  pants: [
    { id: 'pants-poly', name: 'Pantalón training', fabric: 'Poliéster técnico', weight: 190, description: 'Base versátil para entrenamiento y uso cotidiano.', color: '#243238' },
    { id: 'pants-nylon', name: 'Pantalón stretch', fabric: 'Nylon con elastano', weight: 220, description: 'Tejido flexible y resistente para libertad de movimiento.', color: '#172a45' },
    { id: 'pants-knit', name: 'Pantalón soft fit', fabric: 'Tejido deportivo suave', weight: 240, description: 'Base de mayor cuerpo con tacto cómodo.', color: '#31283a' },
  ],
};

const STEPS = [
  { id: 'gender', label: 'Género', question: '¿Para quién es la prenda?' },
  { id: 'style', label: 'Estilo', question: '¿Cuál es el estilo?' },
  { id: 'garment', label: 'Prenda', question: '¿Qué quieres diseñar?' },
  { id: 'base', label: 'Prenda base', question: 'Elige una tela y una base para comenzar.' },
] as const;

const GENDER_OPTIONS: { value: Gender; label: string; detail: string }[] = [
  { value: 'male', label: 'Masculino', detail: 'Corte para hombre' },
  { value: 'female', label: 'Femenino', detail: 'Corte para mujer' },
  { value: 'unisex', label: 'Unisex', detail: 'Corte adaptable' },
];

const STYLE_OPTIONS: { value: Style; label: string; detail: string }[] = [
  { value: 'streetwear', label: 'Streetwear', detail: 'Urbano · libre · expresivo' },
  { value: 'fit', label: 'Fit', detail: 'Limpio · preciso · deportivo' },
];

const GARMENT_OPTIONS: { value: GarmentType; label: string; detail: string }[] = [
  { value: 'tshirt', label: 'Playera', detail: 'Parte superior' },
  { value: 'pants', label: 'Pantalón', detail: 'Parte inferior' },
];

function GarmentIcon({ type, size = 28 }: { type: GarmentType; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {type === 'tshirt' ? (
        <path d="M23 9 14 13 5 25l9 6 5-7v29h26V24l5 7 9-6-9-12-9-4-5 6h-8l-5-6Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      ) : (
        <path d="M17 8h30v15l-4 33H31l-2-22-3 22H11l4-33 2-15Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function BaseGarmentPreview({ type, color }: { type: GarmentType; color: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const colorRef = useRef(color);
  const [modelError, setModelError] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.1, 5);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
    keyLight.position.set(3, 5, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x6ac2d0, 1.1);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let disposed = false;
    let frameId = 0;
    setModelError(false);
    const modelUrl = type === 'pants' ? pantsModelUrl : shirtModelUrl;
    new GLTFLoader().load(modelUrl, (gltf) => {
      if (disposed) {
        gltf.scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => material.dispose());
          }
        });
        return;
      }

      const model = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z) || 1;
      model.scale.setScalar(2.8 / maxDimension);
      model.position.sub(center.multiplyScalar(2.8 / maxDimension));
      model.rotation.y = Math.PI;
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = true;
        object.receiveShadow = true;
        const paint = (material: THREE.Material) => {
          const cloned = material.clone();
          if ('color' in cloned && cloned.color instanceof THREE.Color) cloned.color.set(colorRef.current);
          if ('roughness' in cloned) cloned.roughness = 0.62;
          return cloned;
        };
        object.material = Array.isArray(object.material) ? object.material.map(paint) : paint(object.material);
      });
      modelGroup.add(model);
      modelRef.current = model;
      camera.position.z = type === 'pants' ? 4.6 : 4.2;
      camera.lookAt(0, 0, 0);
    }, undefined, () => {
      if (!disposed) setModelError(true);
    });

    const render = () => {
      frameId = requestAnimationFrame(render);
      if (modelRef.current) modelRef.current.rotation.y += 0.0025;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      modelRef.current = null;
    };
  }, [type]);

  useEffect(() => {
    colorRef.current = color;
    const colors: { material: THREE.Material & { color: THREE.Color }; from: THREE.Color }[] = [];
    modelRef.current?.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if ('color' in material && material.color instanceof THREE.Color) {
          colors.push({ material: material as THREE.Material & { color: THREE.Color }, from: material.color.clone() });
        }
      });
    });

    if (!colors.length) return;
    const target = new THREE.Color(color);
    const startedAt = performance.now();
    let frameId = 0;
    const animateColor = (now: number) => {
      const progress = Math.min((now - startedAt) / 420, 1);
      const eased = 1 - (1 - progress) ** 3;
      colors.forEach(({ material, from }) => material.color.lerpColors(from, target, eased));
      if (progress < 1) frameId = requestAnimationFrame(animateColor);
    };
    frameId = requestAnimationFrame(animateColor);
    return () => cancelAnimationFrame(frameId);
  }, [color]);

  return (
    <div className="relative h-[19rem] w-full overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(106,194,208,0.10),transparent_68%)] sm:h-[23rem]">
      <div ref={mountRef} className="absolute inset-0" />
      {modelError && <div className="absolute inset-0 flex items-center justify-center text-primary"><GarmentIcon type={type} size={112} /></div>}
    </div>
  );
}

export default function Design() {
  const navigate = useNavigate();
  const previewControls = useAnimationControls();
  const [stage, setStage] = useState(0);
  const [gender, setGender] = useState<Gender | null>(null);
  const [style, setStyle] = useState<Style | null>(null);
  const [garmentType, setGarmentType] = useState<GarmentType | null>(null);
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);
  const [activeBaseIndex, setActiveBaseIndex] = useState(0);
  const [previewDirection, setPreviewDirection] = useState<-1 | 0 | 1>(0);
  const baseRailRef = useRef<HTMLDivElement>(null);

  const baseOptions = useMemo(() => garmentType ? BASE_GARMENTS[garmentType] : [], [garmentType]);
  const selectedBase = baseOptions.find((option) => option.id === selectedBaseId) ?? null;
  const activeBase = baseOptions[activeBaseIndex] ?? null;

  useEffect(() => {
    if (stage !== 3) return;
    const frame = requestAnimationFrame(() => {
      baseRailRef.current?.querySelector<HTMLElement>(`[data-base-index="${activeBaseIndex}"]`)?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeBaseIndex, stage]);

  const chooseGender = (value: Gender) => { setGender(value); setStage(1); };
  const chooseStyle = (value: Style) => { setStyle(value); setStage(2); };
  const chooseGarment = (value: GarmentType) => {
    setGarmentType(value);
    setActiveBaseIndex(0);
    setSelectedBaseId(null);
    setPreviewDirection(0);
    setStage(3);
  };

  const moveBase = useCallback((nextIndex: number) => {
    const index = Math.max(0, Math.min(nextIndex, baseOptions.length - 1));
    const option = baseOptions[index];
    if (!option) return;
    if (index !== activeBaseIndex) {
      const direction = index > activeBaseIndex ? 1 : -1;
      setPreviewDirection(direction);
      previewControls.stop();
      previewControls.set({ x: direction * 34, opacity: 0.55 });
      void previewControls.start({ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 24 } });
    }
    setActiveBaseIndex(index);
    setSelectedBaseId(option.id);
    const item = baseRailRef.current?.querySelector<HTMLElement>(`[data-base-index="${index}"]`);
    item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeBaseIndex, baseOptions, previewControls]);

  const openEditor = () => {
    if (!gender || !style || !garmentType || !selectedBase) return;
    const params = new URLSearchParams({
      gender,
      style,
      garment_type: garmentType,
      base_garment: selectedBase.id,
      base_name: selectedBase.name,
      fabric: selectedBase.fabric,
      weight: String(selectedBase.weight),
      color: selectedBase.color,
    });
    navigate(`/editor?${params.toString()}`);
  };

  const goBack = () => {
    setStage((current) => Math.max(0, current - 1));
  };

  const answers = [
    gender ? GENDER_OPTIONS.find((option) => option.value === gender)?.label : null,
    style ? STYLE_OPTIONS.find((option) => option.value === style)?.label : null,
    garmentType ? GARMENT_OPTIONS.find((option) => option.value === garmentType)?.label : null,
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[hsl(var(--editor-bg))] text-[hsl(var(--editor-text))]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(hsl(220 12% 20% / 0.045) 1px, transparent 1px), linear-gradient(90deg, hsl(220 12% 20% / 0.045) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

      <header className="relative z-10 flex items-center justify-between border-b border-slate-300/70 px-5 py-4 sm:px-8 lg:px-12">
        <Link to="/" aria-label="Volver al inicio"><img src={forzaForteLogo} alt="Forza Forte" className="h-8 w-auto" /></Link>
        <div className="hidden items-center gap-2 sm:flex">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              {index > 0 && <span className="h-px w-5 bg-slate-300" />}
              <span className={`flex h-7 w-7 items-center justify-center border text-[10px] ${index < stage ? 'border-primary bg-primary text-primary-foreground' : index === stage ? 'border-primary text-primary' : 'border-slate-300 text-slate-400'}`}>
                {index < stage ? <Check size={13} /> : `0${index + 1}`}
              </span>
              <span className={`font-body text-[9px] uppercase tracking-[0.12em] ${index === stage ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</span>
            </div>
          ))}
        </div>
        <span className="font-body text-[9px] uppercase tracking-[0.16em] text-slate-400 sm:hidden">Etapa {stage + 1} / 4</span>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl grid-cols-1">
        <section className="mx-auto flex w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div key={stage} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }}>
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-primary">Etapa 0{stage + 1} — {STEPS[stage].label}</p>
              <h1 className="mt-4 max-w-3xl font-luxury text-[clamp(2rem,5vw,4.2rem)] font-bold uppercase leading-[1.04] tracking-[0.06em] text-slate-900">{STEPS[stage].question}</h1>

              {stage === 0 && (
                <div className="mt-9 grid max-w-3xl gap-3 sm:grid-cols-3">
                  {GENDER_OPTIONS.map((option) => (
                    <button key={option.value} type="button" onClick={() => chooseGender(option.value)} className="group border border-slate-300 bg-white/80 p-5 text-left transition-colors hover:border-primary hover:bg-primary/[0.04]">
                      <span className="block font-luxury text-sm font-semibold uppercase tracking-[0.1em] text-slate-800 group-hover:text-primary">{option.label}</span>
                      <span className="mt-2 block font-body text-xs text-slate-500">{option.detail}</span>
                    </button>
                  ))}
                </div>
              )}

              {stage === 1 && (
                <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-2">
                  {STYLE_OPTIONS.map((option) => (
                    <button key={option.value} type="button" onClick={() => chooseStyle(option.value)} className="group border border-slate-300 bg-white/80 p-6 text-left transition-colors hover:border-primary hover:bg-primary/[0.04]">
                      <span className="block font-luxury text-sm font-semibold uppercase tracking-[0.1em] text-slate-800 group-hover:text-primary">{option.label}</span>
                      <span className="mt-2 block font-body text-xs text-slate-500">{option.detail}</span>
                    </button>
                  ))}
                </div>
              )}

              {stage === 2 && (
                <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-2">
                  {GARMENT_OPTIONS.map((option) => (
                    <button key={option.value} type="button" onClick={() => chooseGarment(option.value)} className="group flex cursor-pointer items-center gap-4 border border-slate-300 bg-white/80 p-6 text-left transition-colors hover:border-primary hover:bg-primary/[0.04]">
                      <span className="text-primary"><GarmentIcon type={option.value} size={30} /></span>
                      <span><span className="block font-luxury text-sm font-semibold uppercase tracking-[0.1em] text-slate-800 group-hover:text-primary">{option.label}</span><span className="mt-2 block font-body text-xs text-slate-500">{option.detail}</span></span>
                    </button>
                  ))}
                </div>
              )}

              {stage === 3 && (
                <>
                  <p className="mt-4 font-body text-sm text-slate-500">Elige el tejido base para tu {garmentType === 'pants' ? 'pantalón' : 'playera'}.</p>
                  <div className="mt-7 grid items-center gap-5 xl:grid-cols-[minmax(13rem,0.7fr)_minmax(18rem,1.1fr)_minmax(13rem,0.7fr)]">
                    <div className="order-2 border border-slate-200 bg-white/85 p-5 xl:order-1">
                      <p className="font-body text-[9px] uppercase tracking-[0.2em] text-slate-400">{selectedBase ? 'Base seleccionada' : 'Vista previa'}</p>
                      <h2 className="mt-3 font-luxury text-base font-semibold uppercase leading-snug tracking-[0.05em] text-slate-900">{(selectedBase ?? activeBase)?.name}</h2>
                      <p className="mt-2 font-body text-sm text-primary">{(selectedBase ?? activeBase)?.fabric}</p>
                      <p className="mt-1 font-body text-[10px] uppercase tracking-[0.1em] text-slate-400">{(selectedBase ?? activeBase)?.weight} g/m² · gramaje referencial</p>
                      <p className="mt-4 font-body text-xs leading-5 text-slate-500">{(selectedBase ?? activeBase)?.description}</p>
                      {!selectedBase && <p className="mt-5 border-l-2 border-primary pl-3 font-body text-xs text-slate-500">Selecciona esta base en el carrusel para continuar.</p>}
                    </div>

                    <div className="order-1 xl:order-2">
                      {garmentType && activeBase && (
                        <motion.div animate={previewControls} initial={false}>
                          <BaseGarmentPreview type={garmentType} color={(selectedBase ?? activeBase).color} />
                        </motion.div>
                      )}
                    </div>

                    <div className="order-3 border border-slate-200 bg-white/85 p-5">
                      <p className="font-body text-[9px] uppercase tracking-[0.2em] text-slate-400">Tipo de prenda</p>
                      <div className="mt-4 flex items-center gap-3 text-primary"><GarmentIcon type={garmentType ?? 'tshirt'} size={36} /><span className="font-luxury text-xs font-semibold uppercase tracking-[0.1em] text-slate-800">{garmentType === 'pants' ? 'Pantalón' : 'Playera'}</span></div>
                      <div className="mt-5 h-px bg-slate-200" />
                      <p className="mt-4 font-body text-xs leading-5 text-slate-500">La vista 3D y las opciones de tela corresponden al tipo de prenda que seleccionaste.</p>
                      <p className="mt-3 flex items-center gap-2 font-body text-[10px] uppercase tracking-wider text-slate-400">{previewDirection > 0 ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}{previewDirection < 0 ? 'Cambio hacia la izquierda' : previewDirection > 0 ? 'Cambio hacia la derecha' : 'Usa las flechas para cambiar'}</p>
                    </div>
                  </div>

                  <p className="mt-5 font-body text-[10px] text-slate-400">Opciones y gramajes de muestra; se pueden ajustar al catálogo final.</p>

                  <div className="relative mt-7">
                    <button type="button" aria-label="Tela anterior" disabled={activeBaseIndex === 0} onClick={() => moveBase(activeBaseIndex - 1)} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer border border-slate-300 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={19} /></button>
                    <button type="button" aria-label="Tela siguiente" disabled={activeBaseIndex === baseOptions.length - 1} onClick={() => moveBase(activeBaseIndex + 1)} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer border border-slate-300 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={19} /></button>
                    <div ref={baseRailRef} className="flex snap-x snap-mandatory items-center gap-2 overflow-x-auto px-10 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {baseOptions.map((option, index) => {
                        const distance = Math.abs(activeBaseIndex - index);
                        const active = index === activeBaseIndex;
                        return (
                          <motion.button key={option.id} data-base-index={index} type="button" aria-pressed={option.id === selectedBaseId} onClick={() => moveBase(index)} animate={{ scale: active ? 1 : 0.9, opacity: active ? 1 : distance === 1 ? 0.7 : 0.45, rotateY: active ? 0 : index < activeBaseIndex ? 10 : -10 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }} className={`min-w-[11.5rem] flex-1 snap-center cursor-pointer border p-4 text-left transition-colors ${option.id === selectedBaseId ? 'border-primary bg-primary/[0.06]' : 'border-slate-200 bg-white/75 hover:border-slate-400'}`}>
                            <div className="flex items-center justify-between"><span className="text-primary"><GarmentIcon type={garmentType ?? 'tshirt'} size={24} /></span>{option.id === selectedBaseId && <Check size={14} className="text-primary" />}</div>
                            <span className="mt-3 block font-luxury text-[10px] font-semibold uppercase leading-snug tracking-[0.04em] text-slate-800">{option.name}</span>
                            <span className="mt-1 block font-body text-[10px] text-slate-500">{option.fabric}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                  <button type="button" disabled={!gender || !style || !garmentType || !selectedBase} onClick={openEditor} className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 bg-primary px-5 py-3 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300">
                    Ir a editor <ArrowRight size={14} />
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex min-h-10 items-center justify-between">
            {stage > 0 ? (
              <button type="button" onClick={goBack} className="inline-flex items-center gap-2 border border-slate-300 px-4 py-2.5 font-body text-[10px] uppercase tracking-[0.12em] text-slate-600 transition-colors hover:border-slate-500"><ArrowLeft size={13} /> Volver</button>
            ) : <span />}
            <Link to="/collection" className="font-body text-[10px] uppercase tracking-[0.12em] text-slate-400 transition-colors hover:text-slate-700">Salir del diseño <ArrowRight size={12} className="ml-1 inline" /></Link>
          </div>
        </section>

        <aside className="hidden">
          <p className="font-body text-[9px] uppercase tracking-[0.25em] text-slate-400">Tu concepto</p>
          <div className="mt-6 space-y-5">
          {STEPS.slice(0, 3).map((step, index) => (
              <div key={step.id} className="border-b border-slate-200 pb-4">
                <p className="font-body text-[9px] uppercase tracking-[0.15em] text-slate-400">0{index + 1} · {step.label}</p>
                <p className={`mt-2 font-luxury text-xs uppercase tracking-[0.08em] ${answers[index] ? 'text-slate-800' : 'text-slate-300'}`}>{answers[index] || 'Pendiente'}</p>
              </div>
            ))}
            {selectedBase && <div className="border-b border-slate-200 pb-4"><p className="font-body text-[9px] uppercase tracking-[0.15em] text-slate-400">04 · PRENDA BASE</p><p className="mt-2 font-luxury text-xs uppercase tracking-[0.08em] text-slate-800">{selectedBase.name}</p><p className="mt-1 font-body text-[10px] text-slate-500">{selectedBase.fabric}</p></div>}
          </div>
          <p className="mt-8 font-body text-xs leading-6 text-slate-500">Primero definimos la prenda y su tejido. La personalización visual se trabajará en una etapa posterior.</p>
          <button type="button" disabled={!gender || !style || !garmentType || !selectedBase} onClick={openEditor} className="mt-8 inline-flex w-full cursor-pointer items-center justify-center gap-2 bg-primary px-4 py-3 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300">
            Ir a editor <ArrowRight size={14} />
          </button>
        </aside>
      </div>
    </main>
  );
}
