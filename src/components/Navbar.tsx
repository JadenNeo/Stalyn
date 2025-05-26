import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Sprout } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Cultivos', path: '/cultivos' },
    { name: 'Calendario Lunar', path: '/calendario-lunar' },
    { name: 'Clima Diario', path: '/clima' },
  ];

  return (
    <header className="bg-primary-dark text-white shadow-md">
      <div className="container-custom mx-auto py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Guía Agrícola de Salitre</span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-primary-dark/80 transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path}
                className={({ isActive }) => 
                  `text-base font-medium transition-colors hover:text-primary ${
                    isActive ? 'text-primary' : 'text-white'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 animate-slide-down">
            <ul className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink 
                    to={item.path}
                    className={({ isActive }) => 
                      `block py-2 px-4 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-secondary/20 text-primary' 
                          : 'text-white hover:bg-primary-dark/80'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;