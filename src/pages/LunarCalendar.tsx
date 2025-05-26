import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, getDate, parse, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { getMonthLunarData, MonthData } from '../api/lunarApi';
import { getWeatherForecast, ForecastData } from '../api/weatherApi';
import { generateDailyRecommendations, DailyRecommendation, CROPS } from '../utils/recommendationEngine';

const LunarCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lunarData, setLunarData] = useState<MonthData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [recommendations, setRecommendations] = useState<{ [key: string]: DailyRecommendation }>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch lunar and weather data when the month changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        const year = currentDate.getFullYear();
        
        // Fetch lunar data and weather forecast
        const [lunarMonthData, forecast] = await Promise.all([
          getMonthLunarData(month, year),
          getWeatherForecast(7) // Get 7-day forecast
        ]);
        
        setLunarData(lunarMonthData);
        setForecastData(forecast);
        
        // Generate recommendations for each day with available data
        const dailyRecommendations: { [key: string]: DailyRecommendation } = {};
        
        // First process days with forecast (more accurate)
        forecast.forecast.forecastday.forEach(dayForecast => {
          const dayDate = dayForecast.date;
          const lunarDay = lunarMonthData.days.find(day => day.date === dayDate);
          
          if (lunarDay) {
            dailyRecommendations[dayDate] = generateDailyRecommendations(lunarDay, dayForecast);
          }
        });
        
        // Then process remaining days with basic recommendations based only on lunar phase
        lunarMonthData.days.forEach(day => {
          if (!dailyRecommendations[day.date]) {
            // Create a simplified forecast for days without weather data
            const simplifiedForecast = {
              date: day.date,
              day: {
                avgtemp_c: 28, // Average temperature for Salitre
                maxtemp_c: 32,
                mintemp_c: 24,
                totalPrecip_mm: 0,
                condition: {
                  text: 'Sin datos',
                  icon: '',
                  code: 0
                }
              },
              astro: {
                sunrise: '06:00 AM',
                sunset: '06:30 PM',
                moonrise: '00:00 AM',
                moonset: '00:00 PM',
                moon_phase: day.phase,
                moon_illumination: day.illumination.toString()
              },
              hour: []
            };
            
            dailyRecommendations[day.date] = generateDailyRecommendations(day, simplifiedForecast);
          }
        });
        
        setRecommendations(dailyRecommendations);
        setError(null);
        
        // Set the selected day to today if today is in the current month, otherwise to first day of month
        const today = format(new Date(), 'yyyy-MM-dd');
        const firstDayOfMonth = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        if (Object.keys(dailyRecommendations).includes(today)) {
          setSelectedDay(today);
        } else {
          setSelectedDay(firstDayOfMonth);
        }
      } catch (err) {
        console.error('Error fetching calendar data:', err);
        setError('Error al cargar los datos. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentDate]);
  
  // Function to navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  // Function to navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  // Function to handle day selection
  const handleDaySelect = (date: string) => {
    setSelectedDay(date);
  };
  
  // Get the selected day recommendation
  const selectedDayRecommendation = selectedDay ? recommendations[selectedDay] : null;
  
  // Generate weekday headers
  const weekdayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Generate calendar grid
  const generateCalendarGrid = () => {
    if (!lunarData) return null;
    
    // Get the first day of the month
    const firstDay = parse(`${lunarData.year}-${lunarData.month}-01`, 'yyyy-MMMM-dd', new Date(), { locale: es });
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Create an array of days including empty slots for the beginning of the month
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    lunarData.days.forEach(day => {
      days.push(day);
    });
    
    // Split the days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks;
  };
  
  // Get color for recommendation level
  const getRecommendationColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-green-400';
    if (level >= 40) return 'bg-yellow-400';
    if (level >= 20) return 'bg-orange-400';
    return 'bg-red-400';
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary-dark to-success text-white py-12">
        <div className="container-custom mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Calendario Lunar</h1>
          </div>
          <p className="text-xl max-w-3xl">
            Consulte las fases lunares y obtenga recomendaciones diarias para optimizar sus actividades agrícolas 
            según la luna y el clima.
          </p>
        </div>
      </section>
      
      {/* Calendar section */}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar grid */}
              <div className="lg:col-span-2">
                <div className="card">
                  {/* Calendar header */}
                  <div className="flex justify-between items-center p-4 border-b">
                    <button 
                      className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                      onClick={goToPreviousMonth}
                      aria-label="Mes anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <h2 className="text-xl font-bold capitalize">
                      {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </h2>
                    
                    <button 
                      className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                      onClick={goToNextMonth}
                      aria-label="Mes siguiente"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Weekdays header */}
                  <div className="grid grid-cols-7 border-b">
                    {weekdayHeaders.map((day, index) => (
                      <div 
                        key={index} 
                        className="p-2 text-center font-medium text-gray-600"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar days */}
                  <div className="bg-white rounded-b-lg overflow-hidden">
                    {generateCalendarGrid()?.map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
                        {week.map((day, dayIndex) => (
                          <div 
                            key={dayIndex}
                            className={`min-h-24 p-1 border-r last:border-r-0 ${
                              day && isToday(parse(day.date, 'yyyy-MM-dd', new Date()))
                                ? 'bg-primary/10'
                                : ''
                            }`}
                          >
                            {day ? (
                              <button
                                className={`w-full h-full p-1 rounded-md transition-colors ${
                                  selectedDay === day.date
                                    ? 'bg-primary/20'
                                    : 'hover:bg-primary/10'
                                }`}
                                onClick={() => handleDaySelect(day.date)}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium">{day.dayNumber}</span>
                                  <span className="text-lg" title={day.phase}>{day.emoji}</span>
                                </div>
                                
                                {recommendations[day.date] && (
                                  <div className="mt-1 space-y-1">
                                    {/* Icons for activities */}
                                    <div className="flex flex-wrap gap-1">
                                      {recommendations[day.date].activities
                                        .filter(activity => activity.isRecommended)
                                        .slice(0, 3)
                                        .map((activity, i) => (
                                          <span 
                                            key={i} 
                                            className="text-xs bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center"
                                            title={activity.activity}
                                          >
                                            {activity.icon}
                                          </span>
                                        ))}
                                    </div>
                                    
                                    {/* Top crop recommendation */}
                                    {recommendations[day.date].recommendedCrops[0] && (
                                      <div 
                                        className="text-xs px-1 py-0.5 rounded text-white text-center"
                                        style={{
                                          backgroundColor: getRecommendationColor(
                                            recommendations[day.date].recommendedCrops[0].recommendationLevel
                                          )
                                        }}
                                      >
                                        {recommendations[day.date].recommendedCrops[0].cropName}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </button>
                            ) : (
                              <div className="w-full h-full bg-gray-50"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 card p-4">
                  <h3 className="text-lg font-bold mb-3">Leyenda</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Lunar phases */}
                    <div>
                      <h4 className="font-medium mb-2">Fases lunares:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">🌑</span>
                          <span>Luna Nueva</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">🌓</span>
                          <span>Cuarto Creciente</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">🌕</span>
                          <span>Luna Llena</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">🌗</span>
                          <span>Cuarto Menguante</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Activities */}
                    <div>
                      <h4 className="font-medium mb-2">Actividades recomendadas:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">🌱</span>
                          <span>Sembrar</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg mr-2">💧</span>
                          <span>Regar</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg mr-2">✂️</span>
                          <span>Podar</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg mr-2">🧺</span>
                          <span>Cosechar</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg mr-2">💩</span>
                          <span>Abonar</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg mr-2">🌿</span>
                          <span>Desherbar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Day details */}
              <div className="lg:col-span-1">
                {selectedDayRecommendation ? (
                  <div className="card p-6">
                    <h2 className="text-2xl font-bold mb-4">
                      {format(parse(selectedDayRecommendation.date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy', { locale: es })}
                    </h2>
                    
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-1">
                          {lunarData?.days.find(day => day.date === selectedDay)?.emoji}
                        </span>
                        <span className="text-sm font-medium">{selectedDayRecommendation.lunarPhase}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">🌡️</span>
                          <span>{selectedDayRecommendation.temperature}°C</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xl mr-2">💧</span>
                          <span>{selectedDayRecommendation.humidity}% humedad</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Activities */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-3">Actividades recomendadas</h3>
                      
                      <div className="space-y-3">
                        {selectedDayRecommendation.activities.map((activity, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-md ${
                              activity.isRecommended 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <div className="flex items-center mb-1">
                              <span className="text-xl mr-2">{activity.icon}</span>
                              <span className="font-medium">{activity.activity}</span>
                            </div>
                            <p className="text-sm">{activity.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Crop recommendations */}
                    <div>
                      <h3 className="text-lg font-bold mb-3">Cultivos recomendados</h3>
                      
                      <div className="space-y-3">
                        {selectedDayRecommendation.recommendedCrops.slice(0, 3).map((crop, index) => (
                          <div 
                            key={index}
                            className="p-3 rounded-md border"
                            style={{
                              borderColor: getRecommendationColor(crop.recommendationLevel),
                              borderLeftWidth: '4px'
                            }}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <span className="text-xl mr-2">
                                  {CROPS.find(c => c.id === crop.cropId)?.icon}
                                </span>
                                <span className="font-medium">{crop.cropName}</span>
                              </div>
                              <div 
                                className="px-2 py-0.5 text-xs text-white rounded-full"
                                style={{
                                  backgroundColor: getRecommendationColor(crop.recommendationLevel)
                                }}
                              >
                                {crop.recommendationLevel}%
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{crop.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card p-6 flex items-center justify-center h-60">
                    <p className="text-gray-500">Seleccione un día para ver detalles</p>
                  </div>
                )}
                
                {/* Info section */}
                <div className="mt-6 card p-6">
                  <div className="flex items-start mb-4">
                    <Info className="h-5 w-5 text-primary-dark mr-2 mt-0.5" />
                    <h3 className="text-lg font-bold">¿Cómo usar este calendario?</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Este calendario lunar le proporciona recomendaciones basadas en las fases lunares y las 
                    condiciones climáticas previstas. Para cada día, se indican las actividades agrícolas 
                    recomendadas y los cultivos más favorecidos.
                  </p>
                  
                  <div className="bg-primary/10 p-4 rounded-md">
                    <p className="font-medium mb-2">Consejo:</p>
                    <p className="text-sm text-gray-700">
                      Las fases lunares influyen en el movimiento de la savia y la absorción de nutrientes en las plantas. 
                      Siguiendo estas recomendaciones, puede optimizar sus labores agrícolas y obtener mejores resultados 
                      en sus cultivos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LunarCalendar;