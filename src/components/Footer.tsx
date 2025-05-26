import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-dark text-white py-8">
      <div className="container-custom mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Guía Agrícola de Salitre</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Plataforma informativa para agricultores del cantón Salitre, 
              proporcionando recomendaciones basadas en el clima y las fases lunares.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/cultivos" className="text-gray-300 hover:text-primary transition-colors">
                  Cultivos
                </Link>
              </li>
              <li>
                <Link to="/calendario-lunar" className="text-gray-300 hover:text-primary transition-colors">
                  Calendario Lunar
                </Link>
              </li>
              <li>
                <Link to="/clima" className="text-gray-300 hover:text-primary transition-colors">
                  Clima Diario
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-gray-300">Cantón Salitre, Ecuador</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:info@guiaagricolasalitre.ec" className="text-gray-300 hover:text-primary transition-colors">
                  info@guiaagricolasalitre.ec
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:+593000000000" className="text-gray-300 hover:text-primary transition-colors">
                  +593 00 000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Guía Agrícola de Salitre. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;