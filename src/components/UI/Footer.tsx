/** Pie global con identidad de marca y accesos a las páginas disponibles. */
import { Link } from 'react-router-dom';
import forzaForteLogo from '../../assets/forza-forte-logo.png';

export default function Footer() {
  return (
    <footer className="border-t border-white/8 px-6 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.7fr_0.7fr]">
        <div>
          <img src={forzaForteLogo} alt="Forza Forte" className="h-10 w-auto object-contain" />
          <p className="mt-5 max-w-md font-body text-sm leading-7 text-muted-foreground">
            Sportswear con identidad fuerte, direccion contemporanea y tecnologia aplicada para proyectar seguridad, precision y caracter.
          </p>
        </div>

        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.32em] text-primary">Navigate</p>
          <div className="mt-4 flex flex-col gap-3">
            <Link to="/" className="font-body text-sm text-muted-foreground transition-colors hover:text-secondary">Inicio</Link>
            <Link to="/collection" className="font-body text-sm text-muted-foreground transition-colors hover:text-secondary">Colección</Link>
            <Link to="/materials" className="font-body text-sm text-muted-foreground transition-colors hover:text-secondary">Materiales</Link>
            <Link to="/design" className="font-body text-sm text-muted-foreground transition-colors hover:text-secondary">Diseñar</Link>
          </div>
        </div>

        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.32em] text-primary">Brand Note</p>
          <p className="mt-4 font-luxury text-3xl font-extrabold tracking-[0.08em] text-secondary">FORZA FORTE</p>
          <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">Fuerza, innovacion y una lectura visual mas cercana al rendimiento deportivo de alta gama que a una interfaz de videojuego.</p>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/8 pt-6 text-[11px] uppercase tracking-[0.26em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Forza Forte © 2026</span>
        <span>60% Gris oscuro · 30% Blanco premium · 10% Cian</span>
      </div>
    </footer>
  );
}
