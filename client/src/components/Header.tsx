import React from 'react';
import { FaRobot } from 'react-icons/fa';

const Header: React.FC = () => {
  return (
  <header className="header bg-space-gray border-b border-gray-800 glass-effect">
  <div className="container mx-auto px-4 py-3 flex items-center justify-between">

    {/* Левый блок: логотип */}
    <div className="flex items-center space-x-3">
      <div className="logo-circle animate-float">
        <FaRobot className="logo-icon" />
      </div>
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r neon-text-blue">
        Gemini AI
      </h1>
    </div>

    {/* Правый блок: кнопки */}
    <div className="flex items-center flex-shrink-0 gap-x-4">
      <button className="btn-icon settings">
        <i className="fas fa-cog text-xl leading-none"></i>
      </button>
      <button className="btn-icon dark-toggle">
        <i className="fas fa-moon text-xl leading-none"></i>
      </button>
    </div>

  </div>
</header>

  );
};

export default Header;