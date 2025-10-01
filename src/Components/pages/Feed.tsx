import React, { useEffect, useState } from "react";
import Navbar from "../organisms/Navbar";
import BookCard from "../atoms/BookCard";
import type { Book } from "../../types/Book";
import BookCardSimple from "../atoms/BookCardSimple";


const Feed: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<
    Record<string, Book[]>
  >({});
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [carouselIndices, setCarouselIndices] = useState<
    Record<string, number>
  >({});

  const handleSearch = (q: string) => setSearchQuery(q);
  const handleClear = () => setSearchQuery("");

  const normalizeItemToBook = (it: any, idx: number): Book => {
    if (!it) return { id: String(idx), title: "Sin título", authors: [] };
    if (it.title && it.authors) {
      return {
        id: it.id ?? it.key ?? String(idx),
        title: it.title,
        authors: Array.isArray(it.authors)
          ? it.authors
          : it.authors
          ? [String(it.authors)]
          : [],
        publisher: it.publisher ?? undefined,
        published_date: it.published_date ?? it.publishedDate ?? undefined,
        description: it.description ?? undefined,
        thumbnail:
          it.thumbnail ??
          it.image ??
          it.imageLinks?.thumbnail ??
          it.imageLinks?.smallThumbnail ??
          undefined,
      };
    }

    const vi = it.volumeInfo ?? it;
    return {
      id: it.id ?? vi?.id ?? String(idx),
      title: vi?.title ?? "Sin título",
      authors: Array.isArray(vi?.authors)
        ? vi.authors
        : vi?.authors
        ? [String(vi?.authors)]
        : [],
      publisher: vi?.publisher ?? undefined,
      published_date: vi?.publishedDate ?? undefined,
      description: vi?.description ?? undefined,
      thumbnail:
        vi?.imageLinks?.thumbnail ??
        vi?.imageLinks?.smallThumbnail ??
        undefined,
    };
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        // Obtener géneros preferidos de localStorage
        let categories: string[] = [];
        try {
          const raw = localStorage.getItem("user_data");
          if (raw) {
            const parsed = JSON.parse(raw);
            const userObj = parsed.user ?? parsed;
            categories = userObj.preferred_genres || [];
          }
        } catch (e) {
          // ignore
        }
        if (categories.length === 0) {
          categories = ["Fiction", "Science", "History"]; // fallback
        }

        const fetches = categories.map((cat) =>
          fetch(
            `http://localhost:8000/books/review/search?q=subject:${encodeURIComponent(
              cat
            )}&maxResults=10`
          )
            .then((r) =>
              r.ok ? r.json().catch(() => ({ items: [] })) : { items: [] }
            )
            .catch(() => ({ items: [] }))
        );

        const results = await Promise.all(fetches);
        const byGenre: Record<string, Book[]> = {};
        categories.forEach((cat, idx) => {
          const value = results[idx];
          const items = Array.isArray(value)
            ? value
            : Array.isArray(value?.items)
            ? value.items
            : [];
          byGenre[cat] = items.map((it: any, i: number) =>
            normalizeItemToBook(it, i)
          );
        });

        if (mounted) setRecommendations(byGenre);
      } catch (err) {
        console.error("Error cargando feed por categorías", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    // Fetch de recomendaciones personalizadas
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("access_token") ?? "";

        const res = await fetch(
          "http://localhost:8002/api/v1/user/recommendations",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setRecommendedBooks(
              data.map((it: any, idx: number) => normalizeItemToBook(it, idx))
            );
          }
        } else {
          console.warn(
            "[Feed] Recomendaciones fallaron con status:",
            res.status
          );
        }
      } catch (e) {
        console.error("[Feed] Error obteniendo recomendaciones", e);
      }
    };

    load();
    fetchRecommendations();
    return () => {
      mounted = false;
    };
  }, []);

  // Funciones para manejar el carrusel
  const handlePrev = (genre: string, max: number) => {
    setCarouselIndices((prev) => ({
      ...prev,
      [genre]: Math.max((prev[genre] ?? 0) - 1, 0),
    }));
  };

  const handleNext = (genre: string, max: number) => {
    setCarouselIndices((prev) => {
      const current = prev[genre] ?? 0;
      // Evita quedarse sin libros visibles
      const next = Math.min(current + 1, Math.max(0, max - 4));
      return {
        ...prev,
        [genre]: next,
      };
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <Navbar
        onSearch={handleSearch}
        onClear={handleClear}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Buscar libros..."
      />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">Feed</h1>
        <p className="text-lg text-[var(--text-muted)] mb-6">
          Te recomendamos estos libros según tus gustos
        </p>

        {isLoading && (
          <p className="text-[var(--text-muted)]">
            Cargando recomendaciones...
          </p>
        )}

        {Object.entries(recommendations).map(([genre, books]) => {
          const idx = carouselIndices[genre] ?? 0;
          const visibleBooks = books.slice(idx, idx + 4); // muestra 4 libros
          return (
            <section key={genre} className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">{genre}</h2>
              <div className="flex items-center">
               <button
                  className="px-2 py-1 rounded bg-gray-200 text-gray-700 mr-2 disabled:opacity-50 focus:outline-none"
                   onClick={() => handlePrev(genre, books.length)}
                  disabled={idx === 0}
                  aria-label={`Anterior en ${genre}`}
                >
                  &#8592;
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                  {visibleBooks.map((b, i) => (
                    <BookCardSimple key={`${b.id ?? i}-${i}`} {...b} />
                  ))}
                </div>
                <button
                  className="px-2 py-1 rounded bg-gray-200 text-gray-700 ml-2 disabled:opacity-50 focus:outline-none"
                  onClick={() => handleNext(genre, books.length)}
                  disabled={idx + 4 >= books.length}
                  aria-label={`Siguiente en ${genre}`}
                >
                  &#8594;
                </button>
              </div>
             
            </section>
          );
        })}

        {/* Sección de libros recomendados */}
        {recommendedBooks.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              Otros usuarios también han leído
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendedBooks.map((b, i) => (
                <BookCard key={`${b.id ?? i}-rec-${i}`} {...b} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Feed;
