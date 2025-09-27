import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GENRES = [
  { key: 'fiction', label: 'Fiction' },
  { key: 'science', label: 'Science' },
  { key: 'history', label: 'History' },
  { key: 'bography', label: 'Biography' },
  { key: 'romance', label: 'Romance' },
  { key: 'mistery', label: 'Mystery' },
];

type ImagesMap = Record<string, string | undefined>;

const Preferences: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  // Las imágenes para cada género se obtienen desde la carpeta public/images.
  // No se usa localStorage: todo se carga desde archivos estáticos.
  const IMAGES: ImagesMap = {
    fiction: '/images/fiction.jpg',
    science: '/images/science.jpg',
    history: '/images/history.jpg',
    bography: '/images/biography.png',
    romance: '/images/romance.png', // ya existe en public/images
    mistery: '/images/mistery.jpg',
  };
  const images = IMAGES;

  const toggle = (key: string) => {
    setSelected(prev => {
      if (prev.includes(key)) return prev.filter(k => k !== key);
      if (prev.length >= 3) return prev; // limitar a 3
      return [...prev, key];
    });
  };

  const navigate = useNavigate();

  const startIfReady = () => {
    navigate('/feed');
  };

  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tus preferencias de lectura</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">Selecciona hasta 3 géneros. Haz clic en una caja para seleccionar.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {GENRES.map(g => {
          const isSelected = selected.includes(g.key);
          const image = images[g.key];

          const baseStyle: React.CSSProperties = {
            background: 'linear-gradient(135deg, rgba(59,77,204,0.06) 0%, rgba(59,77,204,0.03) 100%)',
            border: '1px solid rgba(59,77,204,0.12)',
            color: 'var(--primary-color)'
          };

          const selectedStyle: React.CSSProperties = image
            ? {
                backgroundImage: `linear-gradient(rgba(2,9,33,0.45), rgba(2,9,33,0.25)), url('${image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'var(--text-on-primary)',
                border: '1px solid rgba(0,0,0,0.12)'
              }
            : {
                background: 'linear-gradient(135deg, rgba(59,77,204,0.12), rgba(5,18,77,0.06))',
                border: '1px solid rgba(59,77,204,0.12)',
                color: 'var(--text-on-primary)'
              };

          return (
            <div key={g.key} className="relative">
              <button
                onClick={() => toggle(g.key)}
                className={`card p-4 rounded-lg text-left flex items-start gap-3 transition-transform transform hover:-translate-y-1 focus:outline-none w-full`}
                style={{ ...(baseStyle), ...(isSelected ? selectedStyle : {}) }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center bg-white/60">
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'inherit' }}>{g.label.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-lg" style={{ color: 'inherit' }}>{g.label}</div>
                  <div className="text-sm text-[var(--text-muted)] mt-1" style={{ visibility: isSelected ? 'hidden' : 'visible' }}>{getGenreDescription(g.key)}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-2">{isSelected ? 'Seleccionado' : 'Toca para seleccionar'}</div>
                </div>
                <div className="ml-3 flex flex-col items-end gap-2">
                  {/* espacio para futuras acciones, ahora vacío */}
                </div>
              </button>
              {/* No hay UI de edición: la imagen se muestra solo si existe en `images` y la tarjeta está seleccionada */}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="text-sm text-[var(--text-muted)]">{selected.length}/3 seleccionados</div>
      </div>

      {selected.length === 3 && (
        <div className="mt-6 p-4 bg-[var(--card-bg-color)] border border-[var(--card-border-color)] rounded-md flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg">¡Increíble! Vamos a iniciar</div>
            <div className="text-sm text-[var(--text-muted)]">Has seleccionado 3 géneros.</div>
          </div>
          <div>
            <button onClick={startIfReady} className="btn-primary px-4 py-2 rounded-md">Siguiente</button>
          </div>
        </div>
      )}

      
    </div>
  );
};

function getGenreDescription(key: string) {
  switch (key) {
    case 'fiction': return 'Historias imaginativas, mundos y personajes memorables.';
    case 'science': return 'Divulgación, descubrimientos y avances científicos.';
    case 'history': return 'Relatos del pasado, biografías históricas y contextos sociales.';
    case 'bography': return 'Vida de personas influyentes y relatos personales.';
    case 'romance': return 'Historias de amor, relaciones y emociones intensas.';
    case 'mistery': return 'Suspenso, investigación y giros inesperados.';
    default: return '';
  }
}

export default Preferences;
