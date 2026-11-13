/** Página de materiales: presenta telas y acabados en una guía interactiva. */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

interface GuideItemData {
  name: string;
  tag: string;
  desc: string;
  detail: string;
}

const FABRICS: GuideItemData[] = [
  { name: 'Poliéster técnico', tag: 'CORE', desc: 'Ligero, transpirable y estable. Ideal para uniformes deportivos, entrenamiento y uso diario.', detail: 'Una opción funcional y lista para producción constante.' },
  { name: 'Nylon premium', tag: 'ENDURANCE', desc: 'Resistente a la abrasión y con una caída refinada que aporta presencia a la prenda.', detail: 'Ideal para exteriores, cápsulas de rendimiento y piezas premium.' },
  { name: 'Licra / Spandex', tag: 'FLEX', desc: 'Elasticidad controlada para prendas de compresión, yoga y entrenamiento técnico.', detail: 'Se integra en prendas de ajuste al cuerpo y paneles de movilidad.' },
  { name: 'Elastano blend', tag: 'MOTION', desc: 'Estiramiento y recuperación para colecciones que priorizan libertad de movimiento.', detail: 'Útil para líneas de alto desempeño y ajuste flexible.' },
];

const FINISHES: GuideItemData[] = [
  { name: 'Bordado', tag: 'LUXE', desc: 'Aporta volumen, textura y durabilidad a logotipos y detalles de marca.', detail: 'Recomendado para identidad central y prendas insignia.' },
  { name: 'DTF', tag: 'VERSATILE', desc: 'Gran nitidez y compatibilidad con múltiples telas para diseños gráficos.', detail: 'Una solución flexible para branding con buena definición.' },
  { name: 'Sublimación', tag: 'FULL COLOR', desc: 'Integra el color en la fibra y permite gráficos permanentes y de superficie completa.', detail: 'Adecuada para diseños que dependen del color y los patrones.' },
  { name: 'Serigrafía', tag: 'ICONIC', desc: 'Técnica sólida para diseños directos y producción de volumen.', detail: 'Funciona bien para colecciones con gráficos repetibles.' },
];

function GuideItem({ item }: { item: GuideItemData }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start justify-between rounded-[20px] px-5 py-5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-luxury text-2xl font-bold tracking-[0.02em] text-secondary sm:text-3xl">{item.name}</h3>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-body text-[10px] uppercase tracking-[0.24em] text-primary">{item.tag}</span>
          </div>
          <p className="mt-3 max-w-xl font-body text-sm leading-7 text-muted-foreground">{item.desc}</p>
        </div>
        <ChevronDown aria-hidden="true" size={18} className={`mt-2 shrink-0 text-primary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <p className="mx-5 mb-5 rounded-[18px] border border-white/10 bg-card/70 px-5 py-4 font-body text-sm leading-7 text-foreground/80">{item.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function GarmentGuide() {
  const [tab, setTab] = useState<'fabrics' | 'finishes'>('fabrics');
  const items = tab === 'fabrics' ? FABRICS : FINISHES;

  return (
    <section id="guide" className="px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
        >
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.34em] text-primary">Material Direction</p>
            <h2 className="mt-5 font-luxury text-[clamp(2.8rem,5vw,4.8rem)] font-extrabold uppercase leading-[0.94] tracking-[0.02em] text-secondary">Materiales pensados para rendimiento real.</h2>
          </div>
          <p className="max-w-2xl font-body text-[15px] leading-8 text-muted-foreground">Una guía práctica para elegir telas y acabados que acompañen el uso, la identidad y la producción de cada prenda.</p>
        </motion.div>

        <div className="mt-10 flex w-fit rounded-full border border-white/10 bg-white/[0.03] p-1.5" role="group" aria-label="Tipo de material">
          <button type="button" aria-pressed={tab === 'fabrics'} onClick={() => setTab('fabrics')} className={`rounded-full px-6 py-3 font-body text-[11px] uppercase tracking-[0.24em] transition-all ${tab === 'fabrics' ? 'bg-primary text-primary-foreground shadow-glow' : 'text-muted-foreground hover:text-secondary'}`}>Telas</button>
          <button type="button" aria-pressed={tab === 'finishes'} onClick={() => setTab('finishes')} className={`rounded-full px-6 py-3 font-body text-[11px] uppercase tracking-[0.24em] transition-all ${tab === 'finishes' ? 'bg-primary text-primary-foreground shadow-glow' : 'text-muted-foreground hover:text-secondary'}`}>Acabados</button>
        </div>

        <div className="mt-8 grid gap-4">
          {items.map((item, index) => (
            <motion.div key={item.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, delay: index * 0.06 }}>
              <GuideItem item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Materials() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-28">
        <section className="px-6 pb-8 pt-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl rounded-[32px] border border-white/8 bg-white/[0.02] px-6 py-10 sm:px-10 lg:px-14">
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.3em] text-primary">Forza Forte specs</p>
            <h1 className="mt-5 font-luxury text-[clamp(2.4rem,6vw,5rem)] font-bold uppercase leading-[0.95] tracking-[0.14em] text-secondary">Materiales y acabados</h1>
            <p className="mt-6 max-w-3xl font-body text-[15px] leading-8 text-muted-foreground">Consulta la guía técnica de telas y acabados sin salir de la experiencia Forza Forte.</p>
          </div>
        </section>
        <GarmentGuide />
      </main>
      <Footer />
    </div>
  );
}
