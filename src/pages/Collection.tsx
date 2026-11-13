/** Colección: muestra diseños, permite filtrarlos y abrir el flujo de publicación. */
import { useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownWideNarrow, ArrowUpDown, Flame, Grid2X2, LayoutGrid, Plus, Upload, X } from 'lucide-react';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import tshirtFrontUrl from '../assets/t-shirt-front.png';
import jeansFrontUrl from '../assets/jeans-front.png';

type Gender = 'male' | 'female' | 'unisex';
type Style = 'streetwear' | 'fit';
type GarmentType = 'tshirt' | 'pants';
type SortOrder = 'popular' | 'recent';

interface Design {
  id: string;
  title: string;
  creator: string;
  gender: Gender;
  style: Style;
  garmentType: GarmentType;
  color: string;
  likes: number;
  createdAt: number;
  fileName?: string;
}

const INITIAL_DESIGNS: Design[] = [
  { id: 'core-01', title: 'Core Motion', creator: 'Diseño de muestra', gender: 'unisex', style: 'fit', garmentType: 'tshirt', color: '#1b2528', likes: 28, createdAt: 5 },
  { id: 'street-01', title: 'Night Circuit', creator: 'Diseño de muestra', gender: 'male', style: 'streetwear', garmentType: 'tshirt', color: '#25222d', likes: 21, createdAt: 4 },
  { id: 'fit-01', title: 'Velocity Form', creator: 'Diseño de muestra', gender: 'female', style: 'fit', garmentType: 'pants', color: '#26353a', likes: 17, createdAt: 3 },
  { id: 'street-02', title: 'Trackline', creator: 'Diseño de muestra', gender: 'unisex', style: 'streetwear', garmentType: 'pants', color: '#34312b', likes: 13, createdAt: 2 },
  { id: 'core-02', title: 'Tempo', creator: 'Diseño de muestra', gender: 'female', style: 'streetwear', garmentType: 'tshirt', color: '#343039', likes: 9, createdAt: 1 },
];

const GENDER_LABEL: Record<Gender, string> = { male: 'MASCULINO', female: 'FEMENINO', unisex: 'UNISEX' };
const STYLE_LABEL: Record<Style, string> = { streetwear: 'STREETWEAR', fit: 'FIT' };
const GARMENT_LABEL: Record<GarmentType, string> = { tshirt: 'PLAYERA', pants: 'PANTALÓN' };

interface Filters {
  gender: 'all' | Gender;
  style: 'all' | Style;
  garmentType: 'all' | GarmentType;
  sort: SortOrder;
}

const INITIAL_FILTERS: Filters = { gender: 'all', style: 'all', garmentType: 'all', sort: 'popular' };

function FilterButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={` border px-3 py-1 font-body text-[10px] uppercase tracking-[0.12em] transition-colors ${active ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground'}`}
    >
      {children}
    </button>
  );
}

function GarmentPreview({ design }: { design: Design }) {
  const mockupUrl = design.garmentType === 'tshirt' ? tshirtFrontUrl : jeansFrontUrl;
  return (
    <div className="flex h-full w-full items-center justify-center p-1" style={{ backgroundColor: design.color }}>
      <img
        src={mockupUrl}
        alt={`Vista de ${GARMENT_LABEL[design.garmentType]}`}
        className="h-full w-full object-contain"
        style={{ mixBlendMode: 'multiply' }}
      />
    </div>
  );
}

function DesignCard({ design, index }: { design: Design; index: number }) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group overflow-hidden  border border-white/10 bg-card/60 transition-colors hover:border-primary/30"
    >
      <div className="relative flex h-56 items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(106,194,208,0.09),transparent_70%)] p-7">
        <div className="h-full w-full max-w-40"><GarmentPreview design={design} /></div>
        {design.fileName && <span className="absolute right-3 top-3  border border-primary/30 bg-background/80 px-2 py-1 font-body text-[9px] uppercase tracking-wider text-primary">GLB IMPORTADO</span>}
      </div>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-luxury text-xs font-semibold uppercase tracking-[0.1em] text-foreground">{design.title}</h2>
            <p className="mt-1 font-body text-[10px] text-muted-foreground">{design.creator}</p>
          </div>
          <button type="button" aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'} aria-pressed={liked} onClick={() => setLiked((value) => !value)} className={` border px-2.5 py-1.5 font-body text-[10px] transition-colors ${liked ? 'border-primary/40 text-primary' : 'border-white/10 text-muted-foreground hover:text-primary'}`}>
            ♥ {design.likes + Number(liked)}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {[GARMENT_LABEL[design.garmentType], GENDER_LABEL[design.gender], STYLE_LABEL[design.style]].map((tag) => (
            <span key={tag} className=" border border-white/10 bg-white/[0.03] px-2 py-1 font-body text-[8px] tracking-[0.08em] text-muted-foreground">{tag}</span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function PublishModal({ onClose, onImport }: { onClose: () => void; onImport: (file: File, title: string) => void }) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'options' | 'import'>('options');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const chooseFile = (selected: File | undefined) => {
    setError('');
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith('.glb')) {
      setFile(null);
      setError('Selecciona un archivo con extensión .glb.');
      return;
    }
    setFile(selected);
    setTitle((current) => current || selected.name.replace(/\.glb$/i, ''));
  };

  const importDesign = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !title.trim()) return;
    onImport(file, title.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button type="button" aria-label="Cerrar ventana" onClick={onClose} className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm" />
        <motion.section role="dialog" aria-modal="true" aria-labelledby="publish-title" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} className="relative w-full max-w-lg  border border-white/10 bg-card p-6 shadow-panel sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.25em] text-primary">Comunidad Forza</p>
              <h2 id="publish-title" className="mt-2 font-luxury text-xl font-bold uppercase tracking-wider text-foreground">Publicar diseño</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar" className=" border border-white/10 p-2 text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>

          {step === 'options' ? (
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setStep('import')} className=" border border-white/10 p-5 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.04]">
                <Upload size={18} className="text-primary" />
                <span className="mt-4 block font-luxury text-xs font-semibold uppercase tracking-wider text-foreground">Importar diseño</span>
                <span className="mt-2 block font-body text-xs leading-5 text-muted-foreground">Sube un modelo 3D en formato .glb.</span>
              </button>
              <button type="button" onClick={() => { onClose(); navigate('/design'); }} className=" border border-white/10 p-5 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.04]">
                <ArrowDownWideNarrow size={18} className="text-primary" />
                <span className="mt-4 block font-luxury text-xs font-semibold uppercase tracking-wider text-foreground">Diseñar</span>
                <span className="mt-2 block font-body text-xs leading-5 text-muted-foreground">Abre el espacio de diseño, actualmente pendiente.</span>
              </button>
            </div>
          ) : (
            <form onSubmit={importDesign} className="mt-7 space-y-5">
              <div>
                <label htmlFor="design-title" className="mb-2 block font-body text-[10px] uppercase tracking-wider text-muted-foreground">Nombre del diseño</label>
                <input id="design-title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={60} className="w-full  border border-white/10 bg-background px-3 py-2.5 font-body text-sm text-foreground outline-none focus:border-primary" placeholder="Ej. Night Force" />
              </div>
              <input ref={fileInputRef} type="file" accept=".glb,model/gltf-binary" onChange={(event) => chooseFile(event.target.files?.[0])} className="sr-only" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full  border border-dashed border-white/20 px-4 py-5 text-left transition-colors hover:border-primary/50">
                <span className="block font-body text-sm text-foreground">{file ? file.name : 'Seleccionar archivo .glb'}</span>
                <span className="mt-1 block font-body text-xs text-muted-foreground">El archivo se agrega a esta sesión de la colección.</span>
              </button>
              {error && <p role="alert" className="font-body text-xs text-red-400">{error}</p>}
              <div className="flex justify-between gap-3">
                <button type="button" onClick={() => setStep('options')} className=" border border-white/10 px-4 py-2.5 font-body text-xs text-muted-foreground hover:text-foreground">Volver</button>
                <button type="submit" disabled={!file || !title.trim()} className=" bg-primary px-5 py-2.5 font-body text-[10px] font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">Agregar a colección</button>
              </div>
            </form>
          )}
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Collection() {
  const [designs, setDesigns] = useState(INITIAL_DESIGNS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showPublish, setShowPublish] = useState(false);
  const [columns, setColumns] = useState<3 | 4>(3);

  const filteredDesigns = useMemo(() => designs
    .filter((design) => filters.gender === 'all' || design.gender === filters.gender)
    .filter((design) => filters.style === 'all' || design.style === filters.style)
    .filter((design) => filters.garmentType === 'all' || design.garmentType === filters.garmentType)
    .sort((a, b) => filters.sort === 'popular' ? b.likes - a.likes : b.createdAt - a.createdAt), [designs, filters]);

  const importDesign = (file: File, title: string) => {
    const design: Design = {
      id: crypto.randomUUID(), title, creator: 'Importación local', gender: 'unisex', style: 'streetwear',
      garmentType: 'tshirt', color: '#1b2528', likes: 0, createdAt: Date.now(), fileName: file.name,
    };
    setDesigns((current) => [design, ...current]);
    setFilters({ ...INITIAL_FILTERS, sort: 'recent' });
  };

  const topDesign = [...designs].sort((a, b) => b.likes - a.likes)[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-32 sm:px-8 lg:px-12">
        <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.32em] text-primary">Catálogo de muestra</p>
            <h1 className="mt-3 font-luxury text-3xl font-bold uppercase tracking-[0.1em] text-secondary sm:text-5xl">Colección</h1>
            <p className="mt-3 max-w-lg font-body text-sm leading-6 text-muted-foreground">Explora diseños, filtra por estilo y prenda, o agrega un modelo 3D a la colección.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden overflow-hidden  border border-white/10 sm:flex">
              <button type="button" aria-label="Tres columnas" aria-pressed={columns === 3} onClick={() => setColumns(3)} className={`p-2.5 ${columns === 3 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><Grid2X2 size={15} /></button>
              <button type="button" aria-label="Cuatro columnas" aria-pressed={columns === 4} onClick={() => setColumns(4)} className={`p-2.5 ${columns === 4 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><LayoutGrid size={15} /></button>
            </div>
            <button type="button" onClick={() => setShowPublish(true)} className="inline-flex items-center gap-2  bg-primary px-4 py-3 font-body text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90"><Plus size={14} /> Publicar</button>
          </div>
        </motion.header>

        {topDesign && (
          <div className="mb-6 flex items-center gap-4  border border-primary/20 bg-card/50 px-4 py-3">
            <Flame size={16} className="shrink-0 text-primary" />
            <span className="font-body text-[9px] uppercase tracking-[0.2em] text-primary">Destacado</span>
            <span className="h-6 w-px bg-white/10" />
            <span className="truncate font-luxury text-xs uppercase tracking-wider text-foreground">{topDesign.title}</span>
            <span className="ml-auto shrink-0 font-body text-[10px] text-muted-foreground">{topDesign.likes} favoritos</span>
          </div>
        )}

        <section aria-label="Filtros de colección" className=" border border-white/10 bg-card/60 p-4 backdrop-blur-xl sm:p-5">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
            <div className="flex flex-col gap-2"><span className="font-body text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Género</span><div className="flex flex-wrap gap-2">
              <FilterButton active={filters.gender === 'all'} onClick={() => setFilters((current) => ({ ...current, gender: 'all' }))}>Todos</FilterButton>
              <FilterButton active={filters.gender === 'male'} onClick={() => setFilters((current) => ({ ...current, gender: 'male' }))}>Masculino</FilterButton>
              <FilterButton active={filters.gender === 'female'} onClick={() => setFilters((current) => ({ ...current, gender: 'female' }))}>Femenino</FilterButton>
              <FilterButton active={filters.gender === 'unisex'} onClick={() => setFilters((current) => ({ ...current, gender: 'unisex' }))}>Unisex</FilterButton>
            </div></div>
            <div className="flex flex-col gap-2"><span className="font-body text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Estilo</span><div className="flex flex-wrap gap-2">
              <FilterButton active={filters.style === 'all'} onClick={() => setFilters((current) => ({ ...current, style: 'all' }))}>Todos</FilterButton>
              <FilterButton active={filters.style === 'streetwear'} onClick={() => setFilters((current) => ({ ...current, style: 'streetwear' }))}>Streetwear</FilterButton>
              <FilterButton active={filters.style === 'fit'} onClick={() => setFilters((current) => ({ ...current, style: 'fit' }))}>Fit</FilterButton>
            </div></div>
            <div className="flex flex-col gap-2"><span className="font-body text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Prenda</span><div className="flex flex-wrap gap-2">
              <FilterButton active={filters.garmentType === 'all'} onClick={() => setFilters((current) => ({ ...current, garmentType: 'all' }))}>Todas</FilterButton>
              <FilterButton active={filters.garmentType === 'tshirt'} onClick={() => setFilters((current) => ({ ...current, garmentType: 'tshirt' }))}>Playera</FilterButton>
              <FilterButton active={filters.garmentType === 'pants'} onClick={() => setFilters((current) => ({ ...current, garmentType: 'pants' }))}>Pantalón</FilterButton>
            </div></div>
            <div className="flex flex-col gap-2"><span className="font-body text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Orden</span><div className="flex flex-wrap gap-2">
              <FilterButton active={filters.sort === 'popular'} onClick={() => setFilters((current) => ({ ...current, sort: 'popular' }))}>Más populares</FilterButton>
              <FilterButton active={filters.sort === 'recent'} onClick={() => setFilters((current) => ({ ...current, sort: 'recent' }))}><ArrowUpDown size={11} /> Más recientes</FilterButton>
            </div></div>
          </div>
        </section>

        <div className="mb-5 mt-7 flex items-center justify-between font-body text-[11px] text-muted-foreground">
          <span>{filteredDesigns.length} diseños</span>
          {(filters.gender !== 'all' || filters.style !== 'all' || filters.garmentType !== 'all') && <button type="button" onClick={() => setFilters(INITIAL_FILTERS)} className="underline decoration-white/20 underline-offset-4 hover:text-foreground">Limpiar filtros</button>}
        </div>
        {filteredDesigns.length ? (
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} `}>
            {filteredDesigns.map((design, index) => <DesignCard key={design.id} design={design} index={index} />)}
          </div>
        ) : (
          <div className=" border border-white/10 py-20 text-center">
            <p className="font-luxury text-sm uppercase tracking-wider text-muted-foreground">Sin resultados</p>
            <button type="button" onClick={() => setFilters(INITIAL_FILTERS)} className="mt-4  border border-primary/30 px-4 py-2 font-body text-[10px] uppercase tracking-wider text-primary">Limpiar filtros</button>
          </div>
        )}
      </main>
      <Footer />
      {showPublish && <PublishModal onClose={() => setShowPublish(false)} onImport={importDesign} />}
    </div>
  );
}
