import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Thermometer, Droplets, Cloud, Calendar } from 'lucide-react';
import { CROPS } from '../utils/recommendationEngine';
import { getCurrentWeather, WeatherData } from '../api/weatherApi';
import { getLunarPhase, LunarPhase } from '../api/lunarApi';

const CropDetail: React.FC = () => {
  const { cropId } = useParams<{ cropId: string }>();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [lunarPhase, setLunarPhase] = useState<LunarPhase | null>(null);
  const [loading, setLoading] = useState(true);
  
  const crop = CROPS.find(c => c.id === cropId);
  
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
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [cropId]);
  
  // Check if crop exists
  if (!crop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Cultivo no encontrado</h2>
          <p className="mb-6">El cultivo que está buscando no existe en nuestra base de datos.</p>
          <Link to="/cultivos" className="btn btn-primary">
            Ver todos los cultivos
          </Link>
        </div>
      </div>
    );
  }
  
  // Calculate current growing conditions
  const getConditionStatus = () => {
    if (!weather || !lunarPhase) return null;
    
    const temperature = weather.current.temp_c;
    const isGoodTemperature = 
      temperature >= crop.optimalTemperature.min && 
      temperature <= crop.optimalTemperature.max;
    
    const isGoodLunarPhase = crop.optimalLunarPhases.includes(lunarPhase.phase);
    
    if (isGoodTemperature && isGoodLunarPhase) {
      return {
        status: 'optimal',
        message: 'Condiciones óptimas para este cultivo',
        color: 'bg-green-100 text-green-800',
      };
    } else if (isGoodTemperature || isGoodLunarPhase) {
      return {
        status: 'good',
        message: 'Condiciones aceptables para este cultivo',
        color: 'bg-yellow-100 text-yellow-800',
      };
    } else {
      return {
        status: 'poor',
        message: 'Condiciones no ideales para este cultivo',
        color: 'bg-red-100 text-red-800',
      };
    }
  };
  
  const conditionStatus = getConditionStatus();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary-dark to-success text-white py-12">
        <div className="container-custom mx-auto">
          <Link to="/cultivos" className="inline-flex items-center text-white hover:text-primary mb-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Volver a cultivos</span>
          </Link>
          
          <div className="flex items-center gap-4 mb-2">
            <span className="text-6xl">{crop.icon}</span>
            <h1 className="text-4xl font-bold text-primary">{crop.name}</h1>
          </div>
          
          <p className="text-xl max-w-3xl">
            {crop.description}
          </p>
        </div>
      </section>
      
      {/* Crop details */}
      <section className="py-12">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main information */}
            <div className="lg:col-span-2">
              <div className="card p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">Características del cultivo</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <Thermometer className="h-5 w-5 text-primary-dark mr-2" />
                      <h3 className="font-bold">Temperatura óptima</h3>
                    </div>
                    <p className="text-gray-700">
                      {crop.optimalTemperature.min}°C - {crop.optimalTemperature.max}°C
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Las temperaturas fuera de este rango pueden afectar el desarrollo y rendimiento.
                    </p>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <Droplets className="h-5 w-5 text-primary-dark mr-2" />
                      <h3 className="font-bold">Necesidad de agua</h3>
                    </div>
                    <p className="text-gray-700 capitalize">
                      {crop.waterNeeds.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {crop.waterNeeds === 'alta' && 'Requiere riego frecuente y abundante.'}
                      {crop.waterNeeds === 'media-alta' && 'Necesita riego regular, especialmente en época seca.'}
                      {crop.waterNeeds === 'media' && 'Riego moderado, evitando encharcamiento.'}
                      {crop.waterNeeds === 'media-baja' && 'Riego espaciado, tolerante a períodos secos cortos.'}
                      {crop.waterNeeds === 'baja' && 'Tolerante a sequía, riego ocasional.'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-primary-dark mr-2" />
                      <h3 className="font-bold">Fase lunar ideal</h3>
                    </div>
                    <p className="text-gray-700">
                      {crop.optimalLunarPhases.join(', ')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Sembrar durante estas fases favorece el desarrollo y producción.
                    </p>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <Cloud className="h-5 w-5 text-primary-dark mr-2" />
                      <h3 className="font-bold">Clima ideal</h3>
                    </div>
                    <p className="text-gray-700">
                      {crop.id === 'arroz' && 'Cálido y húmedo'}
                      {crop.id === 'banano' && 'Tropical húmedo'}
                      {crop.id === 'cacao' && 'Tropical con sombra parcial'}
                      {crop.id === 'sandia' && 'Cálido y seco'}
                      {crop.id === 'soya' && 'Templado a cálido'}
                      {crop.id === 'mango' && 'Tropical seco'}
                      {crop.id === 'maiz' && 'Templado a cálido'}
                      {crop.id === 'verde' && 'Tropical húmedo'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Las condiciones climáticas afectan directamente la calidad y rendimiento.
                    </p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-4">Recomendaciones de cultivo</h3>
                <ul className="space-y-3">
                  {crop.id === 'arroz' && (
                    <>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Prepare el terreno adecuadamente nivelando el suelo para facilitar la inundación uniforme.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Controle el nivel de agua según la etapa del cultivo, desde la siembra hasta la cosecha.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Realice desyerbe manual o químico para evitar la competencia por nutrientes.</span>
                      </li>
                    </>
                  )}
                  
                  {crop.id === 'banano' && (
                    <>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Seleccione terrenos con buen drenaje para evitar encharcamientos que causan pudrición radicular.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Realice deshije regularmente para mantener la densidad adecuada de plantas.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Proteja los racimos con fundas para evitar daños por insectos y mejorar la calidad.</span>
                      </li>
                    </>
                  )}
                  
                  {crop.id === 'cacao' && (
                    <>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Establezca sombra temporal y permanente para proteger las plantas jóvenes.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Pode regularmente para mantener una buena forma del árbol y eliminar ramas improductivas.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Controle la monilia y otras enfermedades mediante podas sanitarias y aplicación de fungicidas.</span>
                      </li>
                    </>
                  )}
                  
                  {crop.id === 'sandia' && (
                    <>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Siembre en suelos bien drenados, con buena exposición solar.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Controle el riego, reduciendo la frecuencia cuando los frutos están madurando.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Utilice acolchado para conservar la humedad y controlar malezas.</span>
                      </li>
                    </>
                  )}
                  
                  {crop.id === 'soya' && (
                    <>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Realice inoculación de semillas con Rhizobium para mejorar la fijación de nitrógeno.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Mantenga un control efectivo de malezas, especialmente en las primeras etapas.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Evite el estrés hídrico durante la floración y llenado de vainas.</span>
                      </li>
                    </>
                  )}
                  
                  {crop.id === 'mango' && (
                    <>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Realice podas de formación en árboles jóvenes y de mantenimiento en adultos.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Suspenda el riego antes de la floración para inducir una buena producción.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Proteja los frutos contra la mosca de la fruta y antracnosis.</span>
                      </li>
                    </>
                  )}
                  
                  {crop.id === 'maiz' && (
                    <>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Prepare bien el terreno asegurando una buena cama de siembra.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Realice fertilización adecuada, especialmente con nitrógeno durante el crecimiento.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Mantenga un buen control de malezas y plagas como el gusano cogollero.</span>
                      </li>
                    </>
                  )}
                  
                  {crop.id === 'verde' && (
                    <>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Seleccione terrenos con buen drenaje y materia orgánica.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Realice deshije y deshoje regularmente para mantener una buena producción.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-dark mr-2">•</span>
                        <span>Controle plagas como picudo negro y sigatoka mediante prácticas culturales y químicas.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="card p-6">
                <h2 className="text-2xl font-bold mb-4">Calendario de cultivo</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-primary/10">
                        <th className="p-3 text-left">Actividad</th>
                        <th className="p-3 text-left">Época recomendada</th>
                        <th className="p-3 text-left">Fase lunar ideal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="p-3">Preparación del terreno</td>
                        <td className="p-3">
                          {crop.id === 'arroz' && 'Diciembre - Enero'}
                          {crop.id === 'banano' && 'Todo el año'}
                          {crop.id === 'cacao' && 'Inicio de lluvias'}
                          {crop.id === 'sandia' && 'Septiembre - Octubre'}
                          {crop.id === 'soya' && 'Diciembre - Enero'}
                          {crop.id === 'mango' && 'Agosto - Septiembre'}
                          {crop.id === 'maiz' && 'Diciembre - Enero'}
                          {crop.id === 'verde' && 'Todo el año'}
                        </td>
                        <td className="p-3">Luna Menguante</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-3">Siembra</td>
                        <td className="p-3">
                          {crop.id === 'arroz' && 'Enero - Febrero'}
                          {crop.id === 'banano' && 'Inicio de lluvias'}
                          {crop.id === 'cacao' && 'Inicio de lluvias'}
                          {crop.id === 'sandia' && 'Octubre - Noviembre'}
                          {crop.id === 'soya' && 'Enero - Febrero'}
                          {crop.id === 'mango' && 'Inicio de lluvias'}
                          {crop.id === 'maiz' && 'Enero - Febrero'}
                          {crop.id === 'verde' && 'Inicio de lluvias'}
                        </td>
                        <td className="p-3">{crop.optimalLunarPhases[0]}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-3">Fertilización</td>
                        <td className="p-3">Según desarrollo del cultivo</td>
                        <td className="p-3">Luna Creciente</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-3">Control de plagas</td>
                        <td className="p-3">Todo el ciclo</td>
                        <td className="p-3">Cualquier fase</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="p-3">Cosecha</td>
                        <td className="p-3">
                          {crop.id === 'arroz' && 'Abril - Mayo'}
                          {crop.id === 'banano' && '9-12 meses después de siembra'}
                          {crop.id === 'cacao' && 'Todo el año, picos en épocas secas'}
                          {crop.id === 'sandia' && '80-100 días después de siembra'}
                          {crop.id === 'soya' && '100-120 días después de siembra'}
                          {crop.id === 'mango' && 'Noviembre - Enero'}
                          {crop.id === 'maiz' && '120 días después de siembra'}
                          {crop.id === 'verde' && '9-12 meses después de siembra'}
                        </td>
                        <td className="p-3">Luna Llena</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Current conditions */}
              <div className="card p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Condiciones actuales</h3>
                
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : weather && lunarPhase && conditionStatus ? (
                  <>
                    <div className={`p-3 rounded-md mb-4 ${conditionStatus.color}`}>
                      <p className="font-medium">{conditionStatus.message}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600 mb-1">Temperatura actual:</p>
                        <div className="flex items-center">
                          <Thermometer className="h-5 w-5 text-primary-dark mr-2" />
                          <span className="text-lg font-medium">{weather.current.temp_c}°C</span>
                          {weather.current.temp_c >= crop.optimalTemperature.min && 
                           weather.current.temp_c <= crop.optimalTemperature.max ? (
                            <span className="ml-2 text-green-600 text-sm">✓ Óptima</span>
                          ) : (
                            <span className="ml-2 text-red-600 text-sm">✗ Fuera de rango</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 mb-1">Fase lunar:</p>
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{lunarPhase.emoji}</span>
                          <span className="text-lg font-medium">{lunarPhase.phase}</span>
                          {crop.optimalLunarPhases.includes(lunarPhase.phase) ? (
                            <span className="ml-2 text-green-600 text-sm">✓ Óptima</span>
                          ) : (
                            <span className="ml-2 text-red-600 text-sm">✗ No ideal</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 mb-1">Humedad:</p>
                        <div className="flex items-center">
                          <Droplets className="h-5 w-5 text-primary-dark mr-2" />
                          <span className="text-lg font-medium">{weather.current.humidity}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 mb-1">Condición climática:</p>
                        <div className="flex items-center">
                          <img 
                            src={weather.current.condition.icon} 
                            alt={weather.current.condition.text}
                            className="w-8 h-8 mr-2"
                          />
                          <span className="text-lg font-medium">{weather.current.condition.text}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between">
                        <Link to="/calendario-lunar" className="text-accent hover:text-accent/80 transition-colors">
                          Calendario lunar
                        </Link>
                        <Link to="/clima" className="text-accent hover:text-accent/80 transition-colors">
                          Pronóstico completo
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">No se pudieron cargar las condiciones actuales.</p>
                )}
              </div>
              
              {/* Tips */}
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">Consejos de cultivo</h3>
                
                <div className="space-y-4">
                  {crop.id === 'arroz' && (
                    <>
                      <p className="text-gray-700">
                        <strong>Plagas comunes:</strong> Sogata, gorgojo, chinche
                      </p>
                      <p className="text-gray-700">
                        <strong>Enfermedades:</strong> Piricularia, añublo de la vaina
                      </p>
                      <p className="text-gray-700">
                        <strong>Rendimiento esperado:</strong> 5-7 toneladas/hectárea
                      </p>
                    </>
                  )}
                  
                  {crop.id === 'banano' && (
                    <>
                      <p className="text-gray-700">
                        <strong>Plagas comunes:</strong> Picudo negro, nemátodos
                      </p>
                      <p className="text-gray-700">
                        <strong>Enfermedades:</strong> Sigatoka, mal de Panamá
                      </p>
                      <p className="text-gray-700">
                        <strong>Rendimiento esperado:</strong> 2000-2500 cajas/hectárea/año
                      </p>
                    </>
                  )}
                  
                  {crop.id === 'cacao' && (
                    <>
                      <p className="text-gray-700">
                        <strong>Plagas comunes:</strong> Monalonion, barrenador
                      </p>
                      <p className="text-gray-700">
                        <strong>Enfermedades:</strong> Monilia, escoba de bruja
                      </p>
                      <p className="text-gray-700">
                        <strong>Rendimiento esperado:</strong> 800-1200 kg/hectárea/año
                      </p>
                    </>
                  )}
                  
                  {crop.id === 'sandia' && (
                    <>
                      <p className="text-gray-700">
                        <strong>Plagas comunes:</strong> Mosca blanca, áfidos
                      </p>
                      <p className="text-gray-700">
                        <strong>Enfermedades:</strong> Mildiu, antracnosis
                      </p>
                      <p className="text-gray-700">
                        <strong>Rendimiento esperado:</strong> 20-30 toneladas/hectárea
                      </p>
                    </>
                  )}
                  
                  {crop.id === 'soya' && (
                    <>
                      <p className="text-gray-700">
                        <strong>Plagas comunes:</strong> Chinches, orugas
                      </p>
                      <p className="text-gray-700">
                        <strong>Enfermedades:</strong> Roya, mildiu
                      </p>
                      <p className="text-gray-700">
                        <strong>Rendimiento esperado:</strong> 2-3 toneladas/hectárea
                      </p>
                    </>
                  )}
                  
                  {crop.id === 'mango' && (
                    <>
                      <p className="text-gray-700">
                        <strong>Plagas comunes:</strong> Mosca de la fruta, trips
                      </p>
                      <p className="text-gray-700">
                        <strong>Enfermedades:</strong> Antracnosis, oídio
                      </p>
                      <p className="text-gray-700">
                        <strong>Rendimiento esperado:</strong> 15-20 toneladas/hectárea/año
                      </p>
                    </>
                  )}
                  
                  {crop.id === 'maiz' && (
                    <>
                      <p className="text-gray-700">
                        <strong>Plagas comunes:</strong> Gusano cogollero, barrenador
                      </p>
                      <p className="text-gray-700">
                        <strong>Enfermedades:</strong> Roya, tizón
                      </p>
                      <p className="text-gray-700">
                        <strong>Rendimiento esperado:</strong> 4-6 toneladas/hectárea
                      </p>
                    </>
                  )}
                  
                  {crop.id === 'verde' && (
                    <>
                      <p className="text-gray-700">
                        <strong>Plagas comunes:</strong> Picudo negro, trips
                      </p>
                      <p className="text-gray-700">
                        <strong>Enfermedades:</strong> Sigatoka, moko
                      </p>
                      <p className="text-gray-700">
                        <strong>Rendimiento esperado:</strong> 20-30 toneladas/hectárea/año
                      </p>
                    </>
                  )}
                  
                  <div className="p-4 bg-primary/10 rounded-md">
                    <p className="font-medium mb-2">Consejo del día:</p>
                    <p className="text-gray-700">
                      {crop.id === 'arroz' && 'Mantenga un monitoreo constante del nivel de agua para optimizar el crecimiento.'}
                      {crop.id === 'banano' && 'La eliminación regular de hojas afectadas por sigatoka mejora la salud general de la planta.'}
                      {crop.id === 'cacao' && 'La poda de mantenimiento debe realizarse preferentemente en luna menguante.'}
                      {crop.id === 'sandia' && 'Evite el contacto directo de los frutos con el suelo para prevenir pudriciones.'}
                      {crop.id === 'soya' && 'Rote con otros cultivos para romper ciclos de plagas y enfermedades.'}
                      {crop.id === 'mango' && 'La inducción floral mediante estrés hídrico mejora la producción uniforme.'}
                      {crop.id === 'maiz' && 'El aporque oportuno fortalece las raíces y previene el acame.'}
                      {crop.id === 'verde' && 'El deshije regular mantiene una densidad óptima y mejora la calidad de los racimos.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CropDetail;