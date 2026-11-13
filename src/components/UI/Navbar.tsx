/** Barra de navegación global: enlaces principales, selector de región y menú móvil. */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, Check } from 'lucide-react';
import forzaForteLogo from '../../assets/forza-forte-logo.png';

const REGIONS = [
  { code: 'MX', flag: '🇲🇽', label: 'México', currency: 'MXN', lang: 'es' },
  { code: 'US', flag: '🇺🇸', label: 'United States', currency: 'USD', lang: 'en' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [region, setRegion] = useState(REGIONS[0]);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-white/10 bg-[rgba(28,30,34,0.78)] px-4 backdrop-blur-xl sm:px-6">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={forzaForteLogo} alt="Forza Forte" className="h-8 w-auto object-contain" />
          <div className="hidden sm:block">
            <p className="font-luxury text-xl font-extrabold tracking-[0.12em] text-secondary">FORZA FORTE</p>
            <p className="font-body text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Performance Sportswear</p>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-2 py-2">
          <Link to="/collection" className="rounded-full px-4 py-2 font-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-secondary">Colección</Link>
          <Link to="/materials" className="rounded-full px-4 py-2 font-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-secondary">Materiales</Link>
          <Link to="/design" className="rounded-full px-4 py-2 font-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-secondary">Diseñar</Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setRegionOpen(!regionOpen)}
              className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 font-body text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-all hover:border-primary/40 hover:text-secondary"
            >
              <Globe size={13} />
              <span>{region.flag} {region.code}</span>
              <ChevronDown size={12} className={`transition-transform ${regionOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {regionOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-3 w-56 overflow-hidden rounded-3xl border border-white/10 bg-card/95 p-2 shadow-panel"
                >
                  {REGIONS.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => { setRegion(option); setRegionOpen(false); }}
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/5"
                    >
                      <div>
                        <p className="font-body text-xs text-secondary">{option.flag} {option.label}</p>
                        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{option.currency} · {option.lang}</p>
                      </div>
                      {region.code === option.code && <Check size={13} className="text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={() => setIsOpen((v) => !v)} className="rounded-full border border-white/10 p-2.5 text-secondary">
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-[28px] border border-white/10 bg-card/95 p-4 shadow-panel md:hidden"
          >
            <div className="flex flex-col gap-2">
              <Link to="/collection" onClick={() => setIsOpen(false)} className="rounded-2xl px-4 py-3 font-body text-sm text-secondary transition-colors hover:bg-white/5">Colección</Link>
              <Link to="/materials" onClick={() => setIsOpen(false)} className="rounded-2xl px-4 py-3 font-body text-sm text-secondary transition-colors hover:bg-white/5">Materiales</Link>
              <Link to="/design" onClick={() => setIsOpen(false)} className="rounded-2xl px-4 py-3 font-body text-sm text-secondary transition-colors hover:bg-white/5">Diseñar</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {regionOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setRegionOpen(false)} />}
    </motion.nav>
  );
}
