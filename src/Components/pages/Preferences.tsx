import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import { useToast } from '../../contexts/ToastContext';

const GENRES = [
  { key: 'Fiction', label: 'Fiction' },
  { key: 'Science', label: 'Science' },
  { key: 'History', label: 'History' },
  { key: 'Biography', label: 'Biography' },
  { key: 'Romance', label: 'Romance' },
  { key: 'Mystery', label: 'Mystery' },
  { key: 'Fantasy', label: 'Fantasy' },
{ key: 'Horror', label: 'Horror' },
{ key: 'Adventure', label: 'Adventure' },
{ key: 'Drama', label: 'Drama' },
{ key: 'Comedy', label: 'Comedy' },
{ key: 'Poetry', label: 'Poetry' },
{ key: 'Young Adult Fiction', label: 'Young Adult Fiction' },
{ key: 'Juvenile Fiction', label: 'Juvenile Fiction' },
{ key: 'Comics & Graphic Novels', label: 'Comics & Graphic Novels' },
{ key: 'True Crime', label: 'True Crime' },

{ key: 'Mathematics', label: 'Mathematics' },
{ key: 'Medicine', label: 'Medicine' },
{ key: 'Technology', label: 'Technology' },
{ key: 'Computers', label: 'Computers' },
{ key: 'Nature', label: 'Nature' },

{ key: 'Philosophy', label: 'Philosophy' },
{ key: 'Religion', label: 'Religion' },
{ key: 'Political Science', label: 'Political Science' },
{ key: 'Social Science', label: 'Social Science' },
{ key: 'Law', label: 'Law' },

{ key: 'Psychology', label: 'Psychology' },
{ key: 'Self Help', label: 'Self Help' },
{ key: 'Health & Fitness', label: 'Health & Fitness' },
{ key: 'Family & Relationships', label: 'Family & Relationships' },

{ key: 'Art', label: 'Art' },
{ key: 'Music', label: 'Music' },
{ key: 'Photography', label: 'Photography' },

{ key: 'Education', label: 'Education' },
{ key: 'Language Arts', label: 'Language Arts' },

{ key: 'Cooking', label: 'Cooking' },
{ key: 'Travel', label: 'Travel' },
{ key: 'Sports & Recreation', label: 'Sports & Recreation' },
{ key: 'Games & Activities', label: 'Games & Activities' },
{ key: 'Crafts & Hobbies', label: 'Crafts & Hobbies' },

{ key: 'Business & Economics', label: 'Business & Economics' }
];

const Preferences: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  // Las imágenes para cada género se obtienen desde la carpeta public/images.
  // No se usa localStorage: todo se carga desde archivos estáticos.
  // Ya no usamos imágenes: mostramos solo una casilla por género

  const toggle = (key: string) => {
    setSelected(prev => {
      if (prev.includes(key)) return prev.filter(k => k !== key);
      if (prev.length >= 3) return prev; // limitar a 3
      return [...prev, key];
    });
  };

  const navigate = useNavigate();
  const { authenticatedFetch, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const startIfReady = async () => {
    if (selected.length !== 3) return;

    if (!isAuthenticated || !isAuthenticated()) {
      showError('Autenticación requerida', 'Debes iniciar sesión para guardar tus preferencias.');
      navigate('/');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1) Enviar los géneros al servicio de recomendaciones (puerto 8002)
      const recRes = await authenticatedFetch('http://localhost:8002/api/v1/user/genres', {
        method: 'POST',
        body: JSON.stringify({ genres: selected }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!recRes.ok) {
        const errData = await recRes.json().catch(() => ({ detail: 'Error enviando géneros' }));
        showError('Error', errData.detail || 'No se pudieron enviar los géneros al servicio de recomendaciones');
        setIsSubmitting(false);
        return;
      }

      // 2) Confirmar en el backend de usuarios que ya seleccionó preferencias
      const confirmRes = await authenticatedFetch('http://localhost:8001/api/accounts/confirm-preferences/', {
        method: 'POST'
      });

      if (!confirmRes.ok) {
        const data = await confirmRes.json().catch(() => ({ detail: 'Error confirmando preferencias' }));
        showError('Error', data.detail || 'No se pudo confirmar preferencias');
        setIsSubmitting(false);
        return;
      }
      
      // Enviar los géneros al endpoint de users para persistir preferred_genres
      const userUpdateRes = await authenticatedFetch('http://localhost:8001/api/accounts/profile/genres/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_genres: selected }),
      });

      if (!userUpdateRes.ok) {
        const userErr = await userUpdateRes.json().catch(() => ({ detail: 'Error actualizando géneros' }));
        showError('Error', userErr.detail || 'No se pudieron actualizar los géneros en el servicio de usuarios');
        setIsSubmitting(false);
        return;
      }

      // Actualizar localStorage.user_data para marcar has_selected_preferences = true
      try {
        const raw = localStorage.getItem('user_data');
        if (raw) {
          const parsed = JSON.parse(raw);
          const userObj = parsed.user ?? parsed;
          userObj.has_selected_preferences = true;
          userObj.preferred_genres = selected;
          if (parsed.user) {
            parsed.user = userObj;
            localStorage.setItem('user_data', JSON.stringify(parsed));
          } else {
            localStorage.setItem('user_data', JSON.stringify(userObj));
          }
        }
      } catch (err) {
        // ignore json errors
      }

      showSuccess('Listo', 'Preferencias guardadas y confirmadas. ¡Bienvenido al feed!');
      navigate('/feed');
    } catch (err) {
      showError('Error', (err as Error).message || 'Ocurrió un error procesando tus preferencias');
    } finally {
      setIsSubmitting(false);
    }
  };

  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tus preferencias de lectura</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">Selecciona hasta 3 géneros. Haz clic en una caja para seleccionar.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GENRES.map(g => {
          const isSelected = selected.includes(g.key);

          return (
            <label
              key={g.key}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors w-full ${isSelected ? 'bg-[var(--card-selected-bg)] border-[var(--card-selected-border)]' : 'bg-[var(--card-bg-color)] border-[var(--card-border-color)]'}`}
              onClick={() => toggle(g.key)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className="w-5 h-5 text-primary-600 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-lg">{g.label}</div>
                <div className="text-sm text-[var(--text-muted)] mt-1">{getGenreDescription(g.key)}</div>
              </div>
              <div className="text-sm text-[var(--text-muted)]">{isSelected ? 'Seleccionado' : 'Tocar para seleccionar'}</div>
            </label>
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
            <button onClick={startIfReady} disabled={isSubmitting} className="btn-primary px-4 py-2 rounded-md">
              {isSubmitting ? 'Enviando...' : 'Siguiente'}
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
};

function getGenreDescription(key: string) {
  switch (key) {
    case 'Fiction': return 'Historias imaginativas, mundos y personajes memorables.';
    case 'Science': return 'Divulgación, descubrimientos y avances científicos.';
    case 'History': return 'Relatos del pasado, biografías históricas y contextos sociales.';
    case 'Biography': return 'Vida de personas influyentes y relatos personales.';
    case 'Romance': return 'Historias de amor, relaciones y emociones intensas.';
    case 'Mystery': return 'Suspenso, investigación y giros inesperados.';
    case 'Fantasy': return 'Mundos mágicos, criaturas míticas y aventuras épicas.';
    case 'Horror': return 'Relatos que inspiran miedo, suspenso y lo sobrenatural.';
    case 'Adventure': return 'Exploraciones, desafíos y viajes emocionantes.';
    case 'Drama': return 'Historias realistas con conflictos humanos intensos.';
    case 'Comedy': return 'Narraciones ligeras, humor y situaciones divertidas.';
    case 'Poetry': return 'Expresión artística a través de versos y emociones.';
    case 'Young Adult Fiction': return 'Relatos juveniles con temas de crecimiento y descubrimiento.';
    case 'Juvenile Fiction': return 'Cuentos y novelas dirigidas a niños y preadolescentes.';
    case 'Comics & Graphic Novels': return 'Historias narradas con ilustraciones y viñetas.';
    case 'True Crime': return 'Casos criminales reales investigados y narrados.';
    
    case 'Mathematics': return 'Teoría, problemas y aplicaciones numéricas.';
    case 'Medicine': return 'Avances médicos, salud y cuidados clínicos.';
    case 'Technology': return 'Innovaciones, herramientas y aplicaciones modernas.';
    case 'Computers': return 'Ciencia de la computación, programación y sistemas.';
    case 'Nature': return 'Estudios del medio ambiente, flora y fauna.';
    
    case 'Philosophy': return 'Reflexiones sobre la existencia, el pensamiento y la ética.';
    case 'Religion': return 'Creencias, prácticas espirituales y tradiciones.';
    case 'Political Science': return 'Gobierno, políticas públicas y relaciones internacionales.';
    case 'Social Science': return 'Estudio de la sociedad, cultura y comportamiento humano.';
    case 'Law': return 'Normas jurídicas, derechos y sistemas legales.';
    
    case 'Psychology': return 'Mente, emociones y conducta humana.';
    case 'Self Help': return 'Consejos para el crecimiento y desarrollo personal.';
    case 'Health & Fitness': return 'Bienestar físico, nutrición y ejercicio.';
    case 'Family & Relationships': return 'Vínculos familiares, amistad y dinámicas sociales.';
    
    case 'Art': return 'Expresiones creativas, pintura, escultura y diseño.';
    case 'Music': return 'Géneros, historia y apreciación musical.';
    case 'Photography': return 'Captura de imágenes, técnica y arte visual.';
    
    case 'Education': return 'Métodos de enseñanza, aprendizaje y pedagogía.';
    case 'Language Arts': return 'Literatura, escritura, gramática y expresión verbal.';
    
    case 'Cooking': return 'Recetas, técnicas culinarias y gastronomía.';
    case 'Travel': return 'Destinos, culturas y experiencias alrededor del mundo.';
    case 'Sports & Recreation': return 'Deportes, actividades físicas y entretenimiento.';
    case 'Games & Activities': return 'Diversión, juegos de mesa y dinámicas recreativas.';
    case 'Crafts & Hobbies': return 'Manualidades, pasatiempos y creatividad práctica.';
    
    case 'Business & Economics': return 'Comercio, finanzas y análisis de mercados.';
    default: return '';
  }
}

export default Preferences;
