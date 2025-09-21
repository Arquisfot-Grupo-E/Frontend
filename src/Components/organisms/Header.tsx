import React from "react";
import Logo from "../atoms/Logo";
import NavLinks from "../molecules/NavLinks";

const Header: React.FC = () => {
  return (
    <header className="bg-[var(--header-bg-color)] border-b-2 border-[var(--card-border-color)] sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo size="lg" />
          <NavLinks />
        </div>
      </div>
    </header>
  );
};

export default Header;
