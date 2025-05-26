import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Cloud, Sun, Thermometer, Droplets, Wind, ArrowRight, CalendarDays } from 'lucide-react';
import { getCurrentWeather, WeatherData } from '../api/weatherApi';
import { getLunarPhase, LunarPhase } from '../api/lunarApi';
import { CROPS } from '../utils/recommendationEngine';

const Home: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [lunarPhase, setLunarPhase] = useState<LunarPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch current weather and lunar phase
        const [weatherData, lunarData] = await Promise.all([
          getCurrentWeather(),
          getLunarPhase(new Date())
        ]);
        
        setWeather(weatherData);
        setLunarPhase(lunarData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-b from-primary-dark to-success py-16 text-white">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="animate-slide-up">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Guía Agrícola de Salitre
              </h1>
              <p className="text-xl mb-6 text-neutral-100">
                Optimiza tus cultivos con recomendaciones basadas en el clima y las fases lunares
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/cultivos" className="btn btn-primary">
                  Ver cultivos
                </Link>
                <Link to="/calendario-lunar" className="btn bg-white text-primary-dark hover:bg-white/90">
                  Calendario lunar
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 to-accent/40 blur-lg"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <span className="text-9xl">{CROPS[Math.floor(Math.random() * CROPS.length)].icon}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Current conditions section */}
      <section className="py-12 bg-background">
        <div className="container-custom mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Condiciones actuales</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-error/10 text-error p-4 rounded-md text-center">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Weather card */}
              {weather && (
                <div className="card p-6 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Clima en Salitre</h3>
                      <div className="flex items-center mb-2">
                        <Thermometer className="h-5 w-5 text-primary-dark mr-2" />
                        <span className="text-xl font-medium">{weather.current.temp_c}°C</span>
                      </div>
                      <p className="text-lg mb-4">{weather.current.condition.text}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Droplets className="h-5 w-5 text-primary-dark mr-2" />
                          <span>Humedad: {weather.current.humidity}%</span>
                        </div>
                        <div className="flex items-center">
                          <Wind className="h-5 w-5 text-primary-dark mr-2" />
                          <span>Viento: {weather.current.wind_kph} km/h</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center bg-neutral/10 p-3 rounded-full">
                      <img 
                        src={weather.current.condition.icon} 
                        alt={weather.current.condition.text}
                        className="w-16 h-16"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link to="/clima" className="flex items-center text-accent hover:text-accent/80 transition-colors">
                      <span className="mr-2">Ver pronóstico detallado</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Lunar phase card */}
              {lunarPhase && (
                <div className="card p-6 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Fase lunar actual</h3>
                      <p className="text-xl font-medium mb-2">
                        {lunarPhase.phase} {lunarPhase.emoji}
                      </p>
                      <p className="mb-4">Iluminación: {lunarPhase.illumination}%</p>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Recomendaciones:</h4>
                        <ul className="space-y-2">
                          {lunarPhase.phase === 'Luna Nueva' && (
                            <li className="flex items-center">
                              <span className="text-lg mr-2">🌱</span>
                              <span>Buen momento para planificar nuevos cultivos</span>
                            </li>
                          )}
                          {lunarPhase.phase === 'Luna Creciente' && (
                            <>
                              <li className="flex items-center">
                                <span className="text-lg mr-2">💧</span>
                                <span>Excelente para regar y fertilizar</span>
                              </li>
                              <li className="flex items-center">
                                <span className="text-lg mr-2">🌱</span>
                                <span>Ideal para sembrar cultivos de fruto</span>
                              </li>
                            </>
                          )}
                          {lunarPhase.phase === 'Luna Llena' && (
                            <>
                              <li className="flex items-center">
                                <span className="text-lg mr-2">🧺</span>
                                <span>Óptimo para cosechar</span>
                              </li>
                              <li className="flex items-center">
                                <span className="text-lg mr-2">🌿</span>
                                <span>Evite trasplantar en esta fase</span>
                              </li>
                            </>
                          )}
                          {lunarPhase.phase === 'Luna Menguante' && (
                            <>
                              <li className="flex items-center">
                                <span className="text-lg mr-2">✂️</span>
                                <span>Ideal para podar</span>
                              </li>
                              <li className="flex items-center">
                                <span className="text-lg mr-2">🌿</span>
                                <span>Buen momento para eliminar malas hierbas</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="w-24 h-24 flex items-center justify-center">
                      <span className="text-8xl">{lunarPhase.emoji}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link to="/calendario-lunar" className="flex items-center text-accent hover:text-accent/80 transition-colors">
                      <span className="mr-2">Ver calendario lunar completo</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Crops section */}
      <section className="py-12 bg-white">
        <div className="container-custom mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Cultivos principales</h2>
          <p className="text-lg text-center mb-8 text-gray-600">
            Información detallada sobre los cultivos más importantes de Salitre
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {CROPS.map((crop) => (
              <Link 
                key={crop.id} 
                to={`/cultivos/${crop.id}`}
                className="card hover:scale-105 transition-all duration-300"
              >
                <div className="p-5 text-center">
                  <div className="text-4xl mb-2">{crop.icon}</div>
                  <h3 className="font-medium">{crop.name}</h3>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/cultivos" className="btn btn-primary">
              Ver todos los cultivos
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-12 bg-background">
        <div className="container-custom mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Características</h2>
          <p className="text-lg text-center mb-8 text-gray-600">
            Herramientas para optimizar su producción agrícola
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 hover:shadow-lg transition-all">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <CalendarDays className="h-8 w-8 text-primary-dark" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Calendario Lunar</h3>
              <p className="text-gray-600 text-center">
                Consulte las fases lunares y sus recomendaciones para las actividades agrícolas.
              </p>
            </div>
            
            <div className="card p-6 hover:shadow-lg transition-all">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Cloud className="h-8 w-8 text-primary-dark" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Pronóstico del Clima</h3>
              <p className="text-gray-600 text-center">
                Acceda a información meteorológica actualizada para planificar sus actividades.
              </p>
            </div>
            
            <div className="card p-6 hover:shadow-lg transition-all">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sun className="h-8 w-8 text-primary-dark" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Recomendaciones</h3>
              <p className="text-gray-600 text-center">
                Obtenga consejos personalizados basados en las condiciones actuales.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-16 bg-gradient-to-r from-secondary to-accent text-white">
        <div className="container-custom mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para mejorar sus cultivos?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Consulte nuestro calendario lunar y pronóstico del clima para tomar mejores decisiones agrícolas.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/calendario-lunar" className="btn bg-white text-primary-dark hover:bg-white/90">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Calendario lunar</span>
            </Link>
            <Link to="/clima" className="btn bg-primary-dark text-white hover:bg-primary-dark/90">
              <Cloud className="h-5 w-5 mr-2" />
              <span>Ver pronóstico</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;