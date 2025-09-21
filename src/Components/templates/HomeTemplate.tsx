import React from "react";
import Header from "../organisms/Header";

type HomeTemplateProps = {
  children: React.ReactNode;
  showHeader?: boolean;
};

const HomeTemplate: React.FC<HomeTemplateProps> = ({ children, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default HomeTemplate;
