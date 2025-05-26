import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { Cloud, Droplets, Thermometer, Wind, ArrowUp, ArrowDown } from 'lucide-react';
import { getCurrentWeather, getWeatherForecast, WeatherData, ForecastData } from '../api/weatherApi';
import { getLunarPhase, LunarPhase } from '../api/lunarApi';

const Weather: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [lunarPhase, setLunarPhase] = useState<LunarPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch current weather, forecast, and lunar phase
        const [weatherData, forecastData, lunarData] = await Promise.all([
          getCurrentWeather(),
          getWeatherForecast(7),
          getLunarPhase(new Date())
        ]);
        
        setCurrentWeather(weatherData);
        setForecast(forecastData);
        setLunarPhase(lunarData);
        setError(null);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Error al cargar los datos del clima. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Function to get weather recommendation based on conditions
  const getWeatherRecommendation = () => {
    if (!currentWeather) return null;
    
    const temp = currentWeather.current.temp_c;
    const humidity = currentWeather.current.humidity;
    const precipitation = currentWeather.current.precip_mm;
    const windSpeed = currentWeather.current.wind_kph;
    const condition = currentWeather.current.condition.text.toLowerCase();
    
    // Check for extreme conditions
    if (temp > 35) {
      return {
        message: 'Temperatura extremadamente alta. Evite trabajos físicos intensos y riegue temprano en la mañana o tarde en la noche.',
        type: 'warning'
      };
    }
    
    if (precipitation > 15) {
      return {
        message: 'Precipitación abundante. Evite labores en el campo que puedan compactar el suelo o promover erosión.',
        type: 'warning'
      };
    }
    
    if (windSpeed > 40) {
      return {
        message: 'Vientos fuertes. No aplique agroquímicos ni fertilizantes, y proteja cultivos sensibles.',
        type: 'warning'
      };
    }
    
    // Check for favorable conditions
    if (temp >= 22 && temp <= 32 && humidity >= 60 && humidity <= 80 && precipitation < 5 && windSpeed < 20) {
      return {
        message: 'Condiciones óptimas para la mayoría de labores agrícolas. Buen momento para sembrar, podar o aplicar fertilizantes según la fase lunar.',
        type: 'positive'
      };
    }
    
    // Specific condition-based recommendations
    if (condition.includes('lluvia') || condition.includes('llovizna')) {
      return {
        message: 'Condiciones lluviosas. Aproveche para sembrar en suelos secos o trasplantar, pero evite labores que compacten el suelo.',
        type: 'neutral'
      };
    }
    
    if (condition.includes('sol') || condition.includes('despejado')) {
      if (temp > 30) {
        return {
          message: 'Día soleado y caluroso. Asegure riego adecuado y proteja plantas sensibles del sol directo en horas pico.',
          type: 'neutral'
        };
      } else {
        return {
          message: 'Día soleado con temperatura moderada. Excelente para la mayoría de labores agrícolas y cosecha.',
          type: 'positive'
        };
      }
    }
    
    if (condition.includes('nublado') || condition.includes('parcialmente nublado')) {
      return {
        message: 'Cielo nublado. Buenas condiciones para trasplantes, siembra y labores que requieran menor estrés por calor.',
        type: 'positive'
      };
    }
    
    // Default recommendation
    return {
      message: 'Condiciones aceptables para labores agrícolas rutinarias. Consulte el calendario lunar para actividades específicas.',
      type: 'neutral'
    };
  };
  
  const weatherRecommendation = getWeatherRecommendation();
  
  // Function to get recommendation background color
  const getRecommendationColor = (type: string | undefined) => {
    switch (type) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-red-100 text-red-800';
      case 'neutral':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary-dark to-success text-white py-12">
        <div className="container-custom mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Cloud className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Clima Diario</h1>
          </div>
          <p className="text-xl max-w-3xl">
            Consulte el pronóstico meteorológico actual y de los próximos días para planificar sus actividades agrícolas.
          </p>
        </div>
      </section>
      
      {/* Weather content */}
      <section className="py-12">
        <div className="container-custom mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-error/10 text-error p-4 rounded-md text-center">
              {error}
            </div>
          ) : (
            <>
              {/* Current weather */}
              {currentWeather && (
                <div className="card p-6 mb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Clima actual en Salitre</h2>
                      <p className="text-gray-600">
                        {format(
                          new Date(currentWeather.location.localtime), 
                          "EEEE d 'de' MMMM, h:mm a", 
                          { locale: es }
                        )}
                      </p>
                    </div>
                    
                    {lunarPhase && (
                      <div className="flex items-center mt-4 md:mt-0">
                        <span className="text-3xl mr-2">{lunarPhase.emoji}</span>
                        <div>
                          <p className="font-medium">{lunarPhase.phase}</p>
                          <p className="text-sm text-gray-600">Iluminación: {lunarPhase.illumination}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 bg-primary/5 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-5xl font-bold">{currentWeather.current.temp_c}°C</p>
                          <p className="text-xl mt-2">{currentWeather.current.condition.text}</p>
                          <p className="text-gray-600 mt-1">Sensación térmica: {currentWeather.current.feelslike_c}°C</p>
                        </div>
                        
                        <div>
                          <img 
                            src={currentWeather.current.condition.icon} 
                            alt={currentWeather.current.condition.text}
                            className="w-24 h-24"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center text-primary-dark mb-2">
                            <Droplets className="h-5 w-5 mr-2" />
                            <span className="font-medium">Humedad</span>
                          </div>
                          <p className="text-2xl font-bold">{currentWeather.current.humidity}%</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center text-primary-dark mb-2">
                            <Wind className="h-5 w-5 mr-2" />
                            <span className="font-medium">Viento</span>
                          </div>
                          <p className="text-2xl font-bold">{currentWeather.current.wind_kph} km/h</p>
                          <p className="text-sm text-gray-600">Dirección: {currentWeather.current.wind_dir}</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center text-primary-dark mb-2">
                            <Droplets className="h-5 w-5 mr-2" />
                            <span className="font-medium">Precipitación</span>
                          </div>
                          <p className="text-2xl font-bold">{currentWeather.current.precip_mm} mm</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center text-primary-dark mb-2">
                            <Thermometer className="h-5 w-5 mr-2" />
                            <span className="font-medium">Presión</span>
                          </div>
                          <p className="text-2xl font-bold">{currentWeather.current.pressure_mb} mb</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center text-primary-dark mb-2">
                            <Cloud className="h-5 w-5 mr-2" />
                            <span className="font-medium">Índice UV</span>
                          </div>
                          <p className="text-2xl font-bold">{currentWeather.current.uv}</p>
                          <p className="text-sm text-gray-600">
                            {currentWeather.current.uv <= 2 ? 'Bajo' : 
                             currentWeather.current.uv <= 5 ? 'Moderado' :
                             currentWeather.current.uv <= 7 ? 'Alto' :
                             currentWeather.current.uv <= 10 ? 'Muy alto' : 'Extremo'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {weatherRecommendation && (
                    <div className={`mt-6 p-4 rounded-md ${getRecommendationColor(weatherRecommendation.type)}`}>
                      <h3 className="font-bold mb-1">Recomendación agrícola:</h3>
                      <p>{weatherRecommendation.message}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Forecast */}
              {forecast && (
                <div className="card p-6">
                  <h2 className="text-2xl font-bold mb-6">Pronóstico de 7 días</h2>
                  
                  <div className="space-y-4">
                    {forecast.forecast.forecastday.map((day, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg ${index === 0 ? 'bg-primary/5' : 'bg-white shadow-sm'}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center mb-3 sm:mb-0">
                            <img 
                              src={day.day.condition.icon} 
                              alt={day.day.condition.text}
                              className="w-12 h-12 mr-3"
                            />
                            <div>
                              <p className="font-bold">
                                {index === 0 ? 'Hoy' : 
                                 index === 1 ? 'Mañana' : 
                                 format(parse(day.date, 'yyyy-MM-dd', new Date()), "EEEE", { locale: es })}
                              </p>
                              <p className="text-sm text-gray-600">
                                {format(parse(day.date, 'yyyy-MM-dd', new Date()), "d 'de' MMMM", { locale: es })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                            <div className="text-center">
                              <p className="text-gray-600 text-sm">Condición</p>
                              <p>{day.day.condition.text}</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-gray-600 text-sm">Temp</p>
                              <div className="flex items-center">
                                <ArrowDown className="h-4 w-4 text-blue-500" />
                                <span className="mx-1">{day.day.mintemp_c}°</span>
                                <ArrowUp className="h-4 w-4 text-red-500" />
                                <span>{day.day.maxtemp_c}°</span>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-gray-600 text-sm">Precip</p>
                              <p>{day.day.totalPrecip_mm} mm</p>
                            </div>
                            
                            <div className="text-center hidden md:block">
                              <p className="text-gray-600 text-sm">Luna</p>
                              <p>{day.astro.moon_phase}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hourly forecast for today */}
                        {index === 0 && (
                          <div className="mt-6 pt-4 border-t border-gray-100">
                            <h4 className="font-medium mb-3">Pronóstico por hora</h4>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                              {day.hour
                                .filter((_, i) => i % 3 === 0) // Show every 3 hours
                                .map((hour, hourIndex) => (
                                  <div key={hourIndex} className="text-center p-2 bg-white rounded-md shadow-sm">
                                    <p className="text-sm text-gray-600">
                                      {format(new Date(hour.time), 'h a')}
                                    </p>
                                    <img 
                                      src={hour.condition.icon} 
                                      alt={hour.condition.text}
                                      className="w-8 h-8 mx-auto my-1"
                                    />
                                    <p className="font-medium">{hour.temp_c}°C</p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Additional information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="card p-6">
                  <h3 className="text-xl font-bold mb-4">Clima y agricultura</h3>
                  <p className="mb-4 text-gray-700">
                    Las condiciones climáticas tienen un impacto directo en el desarrollo y rendimiento de los cultivos. 
                    La temperatura, la humedad, la precipitación y el viento afectan diferentes procesos como la germinación, 
                    el crecimiento vegetativo, la floración y la maduración de frutos.
                  </p>
                  <p className="text-gray-700">
                    En Salitre, el monitoreo constante del clima permite a los agricultores tomar decisiones informadas 
                    sobre cuándo sembrar, regar, aplicar fertilizantes o cosechar, optimizando así sus labores y 
                    reduciendo riesgos asociados a condiciones adversas.
                  </p>
                </div>
                
                <div className="card p-6">
                  <h3 className="text-xl font-bold mb-4">Recomendaciones generales</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary-dark mr-2">•</span>
                      <span>Evite la aplicación de agroquímicos con vientos fuertes o cuando hay pronóstico de lluvia.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-dark mr-2">•</span>
                      <span>Programe el riego considerando las precipitaciones previstas para evitar excesos de humedad.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-dark mr-2">•</span>
                      <span>En días calurosos, realice labores intensivas durante las horas más frescas del día.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-dark mr-2">•</span>
                      <span>Consulte el calendario lunar junto con el pronóstico del clima para optimizar sus actividades.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-dark mr-2">•</span>
                      <span>Implemente sistemas de drenaje adecuados para manejar excesos de lluvia durante la temporada húmeda.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Weather;