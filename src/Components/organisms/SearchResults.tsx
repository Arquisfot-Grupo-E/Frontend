import React, { useState } from "react";
import type { Book } from "../../types/Book";
import BookPricesModal from "../molecules/BookPricesModal";
import { GET_BOOK_PRICES } from "../../graphql/queries";
import { apolloClient } from "../../lib/apolloClient";

interface BookPrice {
  store: string;
  price: string;
  url: string;
  availability: string;
}

type Props = {
  books: Book[];
};

const SearchResults: React.FC<Props> = ({ books }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>("");
  const [prices, setPrices] = useState<BookPrice[]>([]);
  const [localLoading, setLocalLoading] = useState(false);



  // Función para generar URLs específicas para cada tienda
  const generateBookUrl = (source: string, bookTitle: string) => {
    const formattedTitle = bookTitle
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '%20')   // Espacios por %20
      .trim();
    
    switch (source.toLowerCase()) {
      case 'panamericana':
        return `https://www.panamericana.com.co/${formattedTitle}?_q=${formattedTitle}&map=ft`;
      case 'buscalibre':
        return `https://www.buscalibre.com.co/buscar?q=${formattedTitle}`;
      default:
        return `https://www.google.com/search?q=${formattedTitle}`;
    }
  };

  const handleWhereToBuy = async (bookTitle: string) => {
    console.log('=== INICIANDO BÚSQUEDA DE PRECIOS ===');
    console.log('Libro seleccionado:', bookTitle);
    
    setSelectedBookTitle(bookTitle);
    setIsModalOpen(true);
    setPrices([]);
    setLocalLoading(true);
    
    console.log('Modal abierto, ejecutando query GraphQL...');
    
    try {
      // Alternativa: usar cliente directo (comentamos useLazyQuery por ahora)
      console.log('🔄 Intentando SOLO con client.query directo...');
      apolloClient.query({
        query: GET_BOOK_PRICES,
        variables: { bookTitle: bookTitle },
        fetchPolicy: 'network-only',
        context: {
          headers: {
            authorization: ""
          }
        }
      }).then((response) => {
        console.log('🎉 RESPUESTA DIRECTA DEL CLIENT:', response);
        console.log('🎉 DATA:', JSON.stringify(response.data, null, 2));
        setLocalLoading(false);
        
        if (response.data?.getBookPrices?.prices && response.data.getBookPrices.prices.length > 0) {
          // Agrupar precios por tienda y encontrar el mejor de cada una
          const pricesByStore: { [key: string]: any } = {};
          
          // Agrupar por tienda
          for (const price of response.data.getBookPrices.prices) {
            const storeName = price.source || 'Desconocida';
            
            if (!pricesByStore[storeName] || price.price < pricesByStore[storeName].price) {
              pricesByStore[storeName] = price;
            }
          }
          
          console.log('🏪 Mejores precios por tienda:', pricesByStore);
          
          // Convertir a array y transformar para el modal
          const transformedPrices = Object.entries(pricesByStore).map(([storeName, price]) => ({
            store: storeName,
            price: typeof price.price === 'number' 
              ? `$${price.price.toLocaleString('es-CO')}` 
              : `$${price.price}`,
            url: generateBookUrl(storeName, selectedBookTitle),
            availability: "Mejor precio de esta tienda 🏆"
          }));
          
          // Ordenar por precio (menor primero)
          transformedPrices.sort((a, b) => {
            const priceA = parseFloat(a.price.replace(/[$.,]/g, ''));
            const priceB = parseFloat(b.price.replace(/[$.,]/g, ''));
            return priceA - priceB;
          });
          
          console.log('✅ Mejores precios por tienda ordenados:', transformedPrices);
          setPrices(transformedPrices);
        } else {
          console.log('⚠️ No se encontraron precios o array vacío');
          setPrices([]);
        }
      }).catch((error) => {
        console.error('❌ ERROR EN CLIENT.QUERY:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        setLocalLoading(false);
        setPrices([]);
      });
      
    } catch (error) {
      console.error('💥 ERROR EJECUTANDO QUERY:', error);
    }
    
    console.log('Query enviada con variables:', { bookTitle });
    console.log('Estado Apollo después de query:', { loading, error, called, data });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPrices([]);
  };
  if (!books || books.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {books.map((book, idx) => {
        const author =
          book.authors && book.authors.length > 0
            ? book.authors.join(", ")
            : "Desconocido";

        return (
          <div
            key={book.title + idx}
            className="search-result-item book-card-new flex gap-4 items-start p-6"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Imagen */}
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title ?? "Portada"}
                className="w-28 h-40 object-cover rounded-lg shadow-lg border border-[var(--card-border-color)]"
              />
            ) : (
              <div className="w-28 h-40 flex items-center justify-center rounded-lg bg-[var(--card-border-color)] text-sm text-[var(--text-muted)] shadow border border-[var(--card-border-color)]">
                Sin imagen
              </div>
            )}

            {/* Contenido */}
            <div className="flex flex-col flex-1 font-sans">
              <h3 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-[var(--text-color)]">
                {book.title ?? "Título desconocido"}
                {book.published_date && (
                  <span className="text-sm font-medium text-[var(--text-muted)]">
                    ({new Date(book.published_date).getFullYear()})
                  </span>
                )}
              </h3>

              <p className="text-base italic mt-1 text-[var(--text-color)]">{author}</p>

              {book.description && (
                <p className="text-sm mt-3 leading-relaxed text-[var(--text-muted)] line-clamp-3">
                  {book.description}
                </p>
              )}

              {/* Botones */}
              <div className="mt-4 flex gap-3">
                <button
                  className="px-6 py-3 bg-[var(--primary-color)] 
                             text-[var(--text-on-primary)] text-sm font-semibold rounded-lg shadow-lg 
                             hover:scale-105 hover:shadow-xl hover:bg-[var(--accent-color)] 
                             transition-all duration-200"
                >
                  Ver reseñas
                </button>
                <button
                  onClick={() => {
                    console.log('🔥 BOTÓN CLICKEADO!', book.title);
                    handleWhereToBuy(book.title ?? "Título desconocido");
                  }}
                  className="px-6 py-3 bg-[var(--primary-color)] 
                             text-[var(--text-on-primary)] text-sm font-semibold rounded-lg shadow-lg 
                             hover:scale-105 hover:shadow-xl hover:bg-[var(--accent-color)] 
                             transition-all duration-200"
                >
                  ¿Dónde comprarlo?
                </button>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Modal de precios */}
      <BookPricesModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bookTitle={selectedBookTitle}
        prices={prices}
        loading={localLoading}
      />
    </div>
  );
};

export default SearchResults;
