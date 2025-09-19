import "./index.css";
import BookSearch from "./Components/pages/BookSearch";
import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      {/* 🔸 Header */}
      <header className="bg-[var(--primary-color)] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">📚 Bookworm</h1>
        </div>
      </header>

      {/* 🔸 Contenido principal */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold mb-6">
        </h2>

        {/* El componente de búsqueda queda dentro de la página */}
        <BookSearch />
      </main>

      {/* 🔸 Footer */}
      <footer className="bg-[var(--secondary-color)] text-white text-center py-4 mt-10">
        <p>© 2025 BookFinder. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
