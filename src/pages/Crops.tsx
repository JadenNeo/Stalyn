import React from 'react';
import { Link } from 'react-router-dom';
import { CROPS } from '../utils/recommendationEngine';

const Crops: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary-dark to-success text-white py-12">
        <div className="container-custom mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-primary">Cultivos de Salitre</h1>
          <p className="text-xl max-w-3xl">
            Información detallada sobre los principales cultivos agrícolas del cantón Salitre.
            Conozca sus características y recomendaciones de cultivo.
          </p>
        </div>
      </section>
      
      {/* Crops grid */}
      <section className="py-12">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CROPS.map((crop) => (
              <Link 
                key={crop.id}
                to={`/cultivos/${crop.id}`}
                className="card overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="h-40 bg-gradient-to-r from-primary-dark/90 to-success/90 flex items-center justify-center">
                  <span className="text-8xl">{crop.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3">{crop.name}</h3>
                  <p className="text-gray-600 mb-4">{crop.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperatura óptima:</span>
                      <span className="font-medium">
                        {crop.optimalTemperature.min}°C - {crop.optimalTemperature.max}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Necesidad de agua:</span>
                      <span className="font-medium capitalize">
                        {crop.waterNeeds.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fase lunar ideal:</span>
                      <span className="font-medium">
                        {crop.optimalLunarPhases.join(', ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-right">
                    <span className="text-accent font-medium">Ver detalles →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Additional information */}
      <section className="py-12 bg-white">
        <div className="container-custom mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Información general</h2>
          
          <div className="bg-background rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Agricultura en Salitre</h3>
            <p className="mb-4">
              El cantón Salitre, ubicado en la provincia del Guayas, es una región rica en agricultura 
              gracias a su clima tropical y sus fértiles suelos. La economía de Salitre depende en gran 
              medida de la producción agrícola, con cultivos principales como el arroz, banano, cacao y maíz.
            </p>
            <p>
              Las condiciones climáticas de Salitre, con temperaturas promedio entre 24°C y 32°C y una temporada 
              lluviosa bien definida, favorecen una gran variedad de cultivos tropicales. La aplicación de técnicas 
              agrícolas en sintonía con las fases lunares es una práctica tradicional que muchos agricultores 
              mantienen para optimizar sus cosechas.
            </p>
          </div>
          
          <div className="bg-background rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Recomendaciones generales</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-primary-dark mr-2">•</span>
                <span>Consulte regularmente el calendario lunar y el pronóstico del clima antes de planificar actividades agrícolas.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-dark mr-2">•</span>
                <span>Implemente sistemas de riego eficientes, especialmente durante la temporada seca.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-dark mr-2">•</span>
                <span>Realice rotación de cultivos para mantener la fertilidad del suelo y reducir plagas.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-dark mr-2">•</span>
                <span>Utilice abonos orgánicos cuando sea posible para mejorar la calidad del suelo a largo plazo.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-dark mr-2">•</span>
                <span>Considere implementar técnicas de agricultura sostenible para proteger el medio ambiente.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Crops;