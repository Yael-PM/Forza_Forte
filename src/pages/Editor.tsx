import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, ChevronDown, Eye, EyeOff, ImagePlus, Lock, Trash2, Type, Unlock } from 'lucide-react';
import GarmentPreview from '../components/editor/GarmentPreview';
import type { ContentType, GarmentType, Placement } from '../components/editor/GarmentPreview';

type Layer = { id: string; type: ContentType; name: string; text: string; font: string; weight: string; color: string; scale: number; curvature: number; imageUrl: string; width: number; height: number; placement: Placement | null; visible: boolean; locked: boolean };
const FONTS = ['Manrope', 'Orbitron', 'Oswald', 'Georgia', 'Arial', 'Roboto', 'Montserrat', 'Playfair Display', 'Lora', 'Bebas Neue', 'Raleway', 'Poppins', 'Anton', 'Archivo Black', 'Space Grotesk'];
const COLORS = ['#ffffff', '#111820', '#d9a7a0', '#b4313c', '#e87532', '#d7a441', '#b8c9a5', '#477766', '#174a3b', '#4d8c9e', '#8796c7', '#c8b8df'];
const PLACEMENTS: Placement[] = [
  { id: 'p0', label: 'Arriba izquierda', side: 'front', x: 115, y: 120 }, { id: 'p1', label: 'Arriba centro', side: 'front', x: 150, y: 120 }, { id: 'p2', label: 'Arriba derecha', side: 'front', x: 185, y: 120 },
  { id: 'p3', label: 'Centro izquierda', side: 'front', x: 115, y: 190 }, { id: 'p4', label: 'Centro', side: 'front', x: 150, y: 190 }, { id: 'p5', label: 'Centro derecha', side: 'front', x: 185, y: 190 },
  { id: 'p6', label: 'Abajo izquierda', side: 'front', x: 115, y: 260 }, { id: 'p7', label: 'Abajo centro', side: 'front', x: 150, y: 260 }, { id: 'p8', label: 'Abajo derecha', side: 'front', x: 185, y: 260 },
];

export default function Editor() {
  const [params] = useSearchParams();
  const garmentType: GarmentType = params.get('garment_type') === 'pants' ? 'pants' : 'tshirt';
  const [garmentColor, setGarmentColor] = useState(params.get('color') || '#172a45');
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAllColors, setShowAllColors] = useState(false);
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const selected = layers.find((layer) => layer.id === selectedId) ?? null;
  const update = (changes: Partial<Layer>) => setLayers((current) => current.map((layer) => layer.id === selectedId ? { ...layer, ...changes } : layer));
  
  const addLayer = (type: ContentType) => {
    const id = crypto.randomUUID();
    const position = PLACEMENTS[4];
    const next: Layer = { id, type, name: type === 'text' ? `Texto ${layers.filter((l) => l.type === 'text').length + 1}` : `Imagen ${layers.filter((l) => l.type === 'image').length + 1}`, text: 'Tu diseño', font: FONTS[0], weight: '700', color: '#ffffff', scale: 1, curvature: 0, imageUrl: '', width: 120, height: 120, placement: { ...position, side: activeSide }, visible: true, locked: false };
    setLayers((current) => [...current, next]); setSelectedId(id);
  };

  const loadImage = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) update({ imageUrl: URL.createObjectURL(file), name: file.name }); };
  const moveLayer = (index: number, direction: -1 | 1) => setLayers((current) => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const preview = useMemo(() => selected, [selected]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem('forzaforte-design', JSON.stringify({ layers, garmentColor }));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [layers, garmentColor]);

  return (
    <main className="min-h-screen bg-[hsl(var(--editor-bg))] text-[hsl(var(--editor-text))]">
      <header className="flex h-14 items-center justify-between border-b border-slate-300/70 bg-white/80 px-5">
        <Link to="/design" className="inline-flex items-center gap-2 text-xs text-slate-500"><ArrowLeft size={15}/> Volver a diseño</Link>
        <div className="text-center"><b className="font-luxury text-xs uppercase tracking-[.2em]">ForzaLab</b><p className="text-[9px] text-slate-400">{params.get('base_name') || 'Tu prenda'} · Editor</p></div>
        <button onClick={() => { localStorage.setItem('forzaforte-design', JSON.stringify({ layers, garmentColor })); }} className="bg-primary px-4 py-2 text-[10px] uppercase tracking-wider text-white">Guardar diseño</button>
      </header>
      
      <div className="grid min-h-[calc(100vh-56px)] lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Barra lateral izquierda de capas e insumos */}
        <aside className="max-h-[calc(100vh-56px)] overflow-y-auto border-r border-slate-200 bg-white p-4">
          <p className="mb-3 text-[9px] uppercase tracking-[.2em] text-slate-400">Agregar elementos</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => addLayer('text')} className="flex h-16 items-center justify-center gap-2 border border-slate-200 text-xs hover:border-primary"><Type size={18}/> Agregar texto</button>
            <button onClick={() => addLayer('image')} className="flex h-16 items-center justify-center gap-2 border border-slate-200 text-xs hover:border-primary"><ImagePlus size={18}/> Agregar imagen</button>
          </div>
          
          <section className="mt-5 border-t border-slate-100 pt-4">
            <div className="mb-3 flex justify-between"><p className="text-[9px] uppercase tracking-[.2em] text-slate-400">Capas ({layers.length})</p></div>
            {layers.length === 0 && <p className="py-4 text-xs text-slate-400">Agrega texto o una imagen para comenzar.</p>}
            <div className="space-y-1">
              {layers.map((layer, index) => (
                <div key={layer.id} className={`flex items-center gap-1 border px-2 py-2 ${layer.id === selectedId ? 'border-primary bg-primary/5' : 'border-slate-100'}`}>
                  <button onClick={() => { setSelectedId(layer.id); if (layer.placement) setActiveSide(layer.placement.side); }} className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs"><span className="text-primary">{layer.type === 'text' ? <Type size={15}/> : <ImagePlus size={15}/>}</span><span className="truncate">{layer.name}</span></button>
                  <button title="Subir" onClick={() => moveLayer(index, -1)}><ArrowUp size={13}/></button>
                  <button title="Bajar" onClick={() => moveLayer(index, 1)}><ArrowDown size={13}/></button>
                  <button title={layer.visible ? 'Ocultar' : 'Mostrar'} onClick={() => setLayers((all) => all.map((l) => l.id === layer.id ? { ...l, visible: !l.visible } : l))}>{layer.visible ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
                  <button title={layer.locked ? 'Desbloquear' : 'Bloquear'} onClick={() => setLayers((all) => all.map((l) => l.id === layer.id ? { ...l, locked: !l.locked } : l))}>{layer.locked ? <Lock size={14}/> : <Unlock size={14}/>}</button>
                  <button title="Eliminar" onClick={() => { setLayers((all) => all.filter((l) => l.id !== layer.id)); if (selectedId === layer.id) setSelectedId(null); }}><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </section>

          {selected && (
            <section className="mt-5 space-y-4 border-t border-slate-100 pt-4">
              <p className="text-[9px] uppercase tracking-[.2em] text-slate-400">Propiedades de {selected.type === 'text' ? 'texto' : 'imagen'}</p>
              {selected.type === 'text' ? <>
                <label className="block text-[10px] uppercase text-slate-500">Contenido<input disabled={selected.locked} value={selected.text} onChange={(e) => update({ text: e.target.value, name: e.target.value || 'Texto' })} className="mt-1 w-full border border-slate-200 px-3 py-2 text-sm normal-case text-slate-800 disabled:bg-slate-100"/></label>
                <label className="block text-[10px] uppercase text-slate-500">Tipografía<select value={selected.font} onChange={(e) => update({ font: e.target.value })} className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-sm normal-case text-slate-800">{FONTS.map((font) => <option key={font}>{font}</option>)}</select></label>
                <label className="block text-[10px] uppercase text-slate-500">Peso<select value={selected.weight} onChange={(e) => update({ weight: e.target.value })} className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"><option value="400">Regular</option><option value="500">Medium</option><option value="700">Bold</option><option value="900">Black</option></select></label>
                <div><p className="mb-2 text-[10px] uppercase text-slate-500">Color de impresión</p><div className="flex flex-wrap items-center gap-2">{COLORS.slice(0, showAllColors ? COLORS.length : 6).map((color) => <button key={color} aria-label={color} onClick={() => update({ color })} className={`h-6 w-6 rounded-full border ${selected.color === color ? 'ring-2 ring-primary ring-offset-1' : ''}`} style={{ backgroundColor: color }}/ >)}<button onClick={() => setShowAllColors((v) => !v)} className="flex h-6 w-6 items-center justify-center rounded-full border text-slate-500"><ChevronDown size={14}/></button></div></div>
                <label className="block text-[10px] uppercase text-slate-500">Escala · {selected.scale.toFixed(1)}×<input type="range" min=".5" max="2.5" step=".1" value={selected.scale} onChange={(e) => update({ scale: Number(e.target.value) })} className="mt-2 block w-full accent-cyan-700"/></label>
                <label className="block text-[10px] uppercase text-slate-500">Curvatura · {selected.curvature}°<input type="range" min="-45" max="45" value={selected.curvature} onChange={(e) => update({ curvature: Number(e.target.value) })} className="mt-2 block w-full accent-cyan-700"/></label>
              </> : <>
                <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-slate-300 p-4 text-xs"><ImagePlus size={16}/>{selected.imageUrl ? 'Cambiar imagen' : 'Subir imagen'}<input type="file" accept="image/*" onChange={loadImage} className="sr-only"/></label>
                <label className="block text-[10px] uppercase text-slate-500">Ancho · {selected.width}px<input type="range" min="30" max="300" value={selected.width} onChange={(e) => update({ width: Number(e.target.value) })} className="mt-2 block w-full accent-cyan-700"/></label>
                <label className="block text-[10px] uppercase text-slate-500">Alto · {selected.height}px<input type="range" min="30" max="300" value={selected.height} onChange={(e) => update({ height: Number(e.target.value) })} className="mt-2 block w-full accent-cyan-700"/></label>
                <label className="block text-[10px] uppercase text-slate-500">Escala · {selected.scale.toFixed(1)}×<input type="range" min=".3" max="1.8" step=".1" value={selected.scale} onChange={(e) => update({ scale: Number(e.target.value) })} className="mt-2 block w-full accent-cyan-700"/></label>
              </>}
              <div>
                <p className="mb-2 text-[10px] uppercase text-slate-500">Posición rápida</p>
                <div className="mx-auto grid w-28 grid-cols-3 gap-1">
                  {PLACEMENTS.map((position) => (
                    <button 
                      key={position.id} 
                      title={position.label} 
                      aria-label={position.label} 
                      disabled={selected.locked}
                      onClick={() => update({ placement: position })} 
                      className={`aspect-square border ${selected.placement?.id === position.id ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-slate-50 hover:border-primary'}`}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="mt-5 border-t border-slate-100 pt-4">
            <p className="mb-2 text-[9px] uppercase tracking-[.2em] text-slate-400">Color de prenda</p>
            <div className="flex flex-wrap gap-2">{['#111820','#263c52','#f0eee8','#b4313c','#477766','#77717f','#d7a441','#ffffff'].map((color) => <button key={color} aria-label={`Prenda ${color}`} onClick={() => setGarmentColor(color)} className={`h-6 w-6 rounded-full border ${garmentColor === color ? 'ring-2 ring-primary ring-offset-1' : ''}`} style={{ backgroundColor: color }}/>)}</div>
          </section>
        </aside>

        {/* Área central principal de previsualización */}
        <section className="flex min-h-[70vh] w-full flex-1 flex-col items-center justify-center bg-slate-100/70 p-5 sm:p-10">
          <div className="flex h-full w-full items-center justify-center">
            <GarmentPreview 
              garmentType={garmentType} 
              color={garmentColor} 
              contentType={preview?.type ?? null} 
              layerId={preview?.id ?? null}
              layerIds={layers.map((layer) => layer.id)}
              visible={preview?.visible ?? true}
              locked={preview?.locked ?? false}
              text={preview?.type === 'text' ? preview.text : ''} 
              font={preview?.font ?? FONTS[0]} 
              fontWeight={preview?.weight} 
              textColor={preview?.color ?? '#ffffff'} 
              textScale={preview?.scale ?? 1} 
              curvature={preview?.curvature ?? 0} 
              imageUrl={preview?.type === 'image' ? preview.imageUrl : ''} 
              imageScale={preview?.scale ?? 1} 
              imageWidth={preview?.width} 
              imageHeight={preview?.height} 
              placement={preview?.placement ?? null}
              onSelectLayer={(id) => { const layer = layers.find((item) => item.id === id); setSelectedId(id); if (layer?.placement) setActiveSide(layer.placement.side); }}
              onLayerChange={(id, changes) => setLayers((all) => all.map((layer) => layer.id === id ? { ...layer, ...changes, ...(changes.text !== undefined ? { name: changes.text || 'Texto' } : {}) } : layer))}
              onSideChange={(nextSide) => { setActiveSide(nextSide); if (preview?.placement) update({ placement: { ...preview.placement, side: nextSide } }); }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
