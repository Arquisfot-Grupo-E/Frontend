import React from "react";

interface BookPrice {
  store: string;
  price: string;
  url: string;
  availability: string;
}

interface BookPricesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  prices: BookPrice[];
  loading: boolean;
}

const BookPricesModal: React.FC<BookPricesModalProps> = ({
  isOpen,
  onClose,
  bookTitle,
  prices,
  loading,
}) => {
  console.log('=== MODAL RENDER ===');
  console.log('isOpen:', isOpen);
  console.log('bookTitle:', bookTitle);
  console.log('prices:', prices);
  console.log('loading:', loading);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">¿Dónde comprarlo?</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">{bookTitle}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)] mx-auto"></div>
              <p className="text-gray-600 mt-2">Buscando precios...</p>
            </div>
          ) : prices.length > 0 ? (
            <div className="space-y-4">
              {prices.map((price, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{price.store}</h3>
                    <span className="text-lg font-bold text-[var(--primary-color)]">{price.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{price.availability}</p>
                  <a
                    href={price.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center px-4 py-2 bg-[var(--primary-color)] text-[var(--text-on-primary)] rounded-lg hover:bg-[var(--accent-color)] transition-colors"
                  >
                    Ir a comprar →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No se encontraron precios para este libro.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookPricesModal;