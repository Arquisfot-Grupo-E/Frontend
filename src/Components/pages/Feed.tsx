import React, { useState } from 'react';
import Navbar from '../organisms/Navbar';

const Feed: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState('');

	const handleSearch = (q: string) => {
		// Implementa búsqueda si la página necesita mostrar resultados
		setSearchQuery(q);
	};

	const handleClear = () => {
		setSearchQuery('');
	};

	return (
		<div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
			<Navbar onSearch={handleSearch} onClear={handleClear} searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Buscar libros..." />
			<main className="max-w-4xl mx-auto px-6 py-12">
				<h1 className="text-3xl font-bold mb-4">Este es el feed</h1>
				<p className="text-lg text-[var(--text-muted)]">Aquí irán las publicaciones, reseñas y recomendaciones.</p>
			</main>
		</div>
	);
};

export default Feed;

