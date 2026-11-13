/** Hero de la landing con presentación de marca y llamadas a la acción. */
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.78, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.12]);

  return (
    <section ref={ref} className="luxury-shell relative flex min-h-[92vh] items-center justify-center overflow-hidden px-6 pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(106,194,208,0.11),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_30%)]" />
      <div className="absolute inset-x-0 top-28 mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <motion.div
        style={{ y, opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <motion.p variants={itemVariants} className="mb-5 font-body text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          Performance sportswear system
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="font-luxury text-[clamp(2.8rem,8vw,6.2rem)] font-bold uppercase leading-[0.92] tracking-[0.16em] text-secondary"
        >
          Build your Forza
        </motion.h1>

        <motion.div variants={itemVariants} className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />

        <motion.p
          variants={itemVariants}
          className="mx-auto mt-8 max-w-2xl font-body text-[15px] leading-8 text-muted-foreground sm:text-[16px]"
        >
          Diseña prendas con una identidad deportiva clara, una lectura visual premium y una experiencia digital enfocada en fuerza, innovación y control.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/design" className="luxury-button">
            Diseñar prenda
            <ArrowRight size={14} />
          </Link>
          <Link to="/materials" className="luxury-button-secondary">Explorar materiales</Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
