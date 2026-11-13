/** Pantalla de carga animada que informa cuando la entrada visual termina. */
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import forzaForteLogo from '../../assets/forza-forte-logo.png';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 2300);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        key="loader"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#1e2126]"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(106,194,208,0.14),transparent_28%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 scale-[1.6] rounded-full bg-primary/20 blur-3xl" />
            <img src={forzaForteLogo} alt="Forza Forte" className="relative z-10 h-auto w-40 object-contain" />
          </motion.div>

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-8 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="mt-5 font-body text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground"
          >
            Performance system loading
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
