import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavLinks: React.FC = () => {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Inicio' },
    { path: '/search', label: 'Buscar' },
    { path: '/my-reviews', label: 'Mis Reseñas' },
  ];

  return (
    <nav className="flex gap-6">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`text-sm font-medium transition-colors duration-200 hover:text-[var(--accent-color)] ${
            location.pathname === link.path
              ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]'
              : 'text-[var(--text-color)]'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default NavLinks;
