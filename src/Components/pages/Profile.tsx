import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileService, type ProfileResponse } from '../../services/profile';
import { useMyReviews } from '../../hooks/useMyReviews';
import ReviewList from '../organisms/ReviewList';
import Navbar from '../organisms/Navbar';

export default function ProfileView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState<ProfileResponse | null>(null);

  // Reseñas del usuario (reutilizamos el flujo de MyReviews)
  const { reviews, reviewsLoading, bookInfos, userVotes,
          handleUpdateReview, handleDeleteReview, handleVoteReview } = useMyReviews();

  useEffect(() => {
    (async () => {
      try {
        const data = await ProfileService.get();
        setServer(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="animate-pulse p-6 rounded-2xl border bg-[var(--card-bg-color)]" />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="p-6 rounded-2xl border bg-[var(--card-bg-color)]">
          <p className="text-[var(--text-muted)]">No pudimos cargar tu perfil.</p>
        </div>
      </div>
    );
  }

  const fullName = `${server.user.first_name ?? ''} ${server.user.last_name ?? ''}`.trim();

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
        <Navbar
            onSearch={() => {}}
            onClear={() => {}}
            searchQuery={""}
            setSearchQuery={() => {}}
            placeholder="Buscar libros..."
        />
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Card header perfil */}
        <div className="bg-[var(--card-bg-color)] rounded-2xl p-6 mb-8 border border-[var(--card-border-color)] shadow-sm">
          {/* Avatar placeholder centrado */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-24 h-24 rounded-full bg-[var(--card-border-color)] flex items-center justify-center overflow-hidden cursor-not-allowed"
              title="Avatar en construcción"
            >
              {server.avatar ? (
                <img src={server.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[var(--text-muted)] text-3xl font-bold">+</span>
              )}
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-semibold text-[var(--text-color)]">
                {fullName || 'Usuario'}
              </h1>

              {/* Email “sólo lectura” con look gris */}
              <input
                value={server.user.email ?? ''}
                disabled
                className="mt-2 w-full sm:w-80 text-center px-3 py-2 rounded-lg border bg-gray-100 text-gray-500 cursor-not-allowed"
              />

              <p className="mt-3 text-[var(--text-muted)]">
                {server.bio || 'Sin biografía'}
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={() => navigate('/profile/edit')}
                className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-[var(--text-on-primary)] font-medium hover:bg-[var(--primary-color)] transition shadow-sm"
              >
                Editar perfil
              </button>
            </div>
          </div>
        </div>

        {/* Mis Reseñas */}
        <div className="bg-[var(--card-bg-color)] rounded-2xl p-6 border border-[var(--card-border-color)] shadow-sm">
          <h2 className="text-xl font-bold text-[var(--text-color)] mb-4">Mis Reseñas</h2>

          <ReviewList
            reviews={reviews}
            bookInfos={bookInfos}
            loading={reviewsLoading}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
            onVoteReview={handleVoteReview}
            userVotes={userVotes}
          />
        </div>
      </div>
    </div>
  );
}
