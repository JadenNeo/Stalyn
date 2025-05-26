import axios from 'axios';
import { format, addDays, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';

// Types
export interface LunarPhase {
  date: string;
  phase: string;
  illumination: number;
  emoji: string;
}

export interface MonthData {
  month: string;
  year: number;
  days: LunarPhaseDay[];
}

export interface LunarPhaseDay {
  date: string;
  phase: string;
  illumination: number;
  emoji: string;
  dayNumber: number;
  isCurrentMonth: boolean;
}

const WEATHER_API_KEY = '74aa2d296b6c451782161002252405';
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

export const getLunarPhase = async (date: Date = new Date()): Promise<LunarPhase> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/astronomy.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: 'Salitre, Ecuador',
        dt: formattedDate,
      },
    });
    
    const { moon_phase, moon_illumination } = response.data.astronomy.astro;
    
    return {
      date: formattedDate,
      phase: getLunarPhaseName(moon_phase),
      illumination: parseInt(moon_illumination),
      emoji: getLunarPhaseEmoji(moon_phase),
    };
  } catch (error) {
    console.error('Error fetching lunar phase:', error);
    throw error;
  }
};

export const getMonthLunarData = async (month?: number, year?: number): Promise<MonthData> => {
  const currentDate = new Date();
  const targetMonth = month !== undefined ? month : getMonth(currentDate) + 1;
  const targetYear = year !== undefined ? year : getYear(currentDate);
  
  try {
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const days: LunarPhaseDay[] = [];
    
    // Fetch lunar data for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth - 1, day);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const response = await axios.get(`${WEATHER_API_BASE_URL}/astronomy.json`, {
        params: {
          key: WEATHER_API_KEY,
          q: 'Salitre, Ecuador',
          dt: formattedDate,
        },
      });
      
      const { moon_phase, moon_illumination } = response.data.astronomy.astro;
      
      days.push({
        date: formattedDate,
        phase: getLunarPhaseName(moon_phase),
        illumination: parseInt(moon_illumination),
        emoji: getLunarPhaseEmoji(moon_phase),
        dayNumber: day,
        isCurrentMonth: true,
      });
    }
    
    return {
      month: format(new Date(targetYear, targetMonth - 1, 1), 'MMMM', { locale: es }),
      year: targetYear,
      days,
    };
  } catch (error) {
    console.error('Error fetching month lunar data:', error);
    throw error;
  }
};

// Helper function to get the lunar phase name based on the API response
function getLunarPhaseName(phase: string): string {
  switch (phase.toLowerCase()) {
    case 'new moon':
      return 'Luna Nueva';
    case 'waxing crescent':
      return 'Luna Creciente';
    case 'first quarter':
      return 'Cuarto Creciente';
    case 'waxing gibbous':
      return 'Gibosa Creciente';
    case 'full moon':
      return 'Luna Llena';
    case 'waning gibbous':
      return 'Gibosa Menguante';
    case 'last quarter':
      return 'Cuarto Menguante';
    case 'waning crescent':
      return 'Luna Menguante';
    default:
      return phase;
  }
}

// Helper function to get emoji based on the lunar phase
function getLunarPhaseEmoji(phase: string): string {
  switch (phase.toLowerCase()) {
    case 'new moon':
      return '🌑';
    case 'waxing crescent':
      return '🌒';
    case 'first quarter':
      return '🌓';
    case 'waxing gibbous':
      return '🌔';
    case 'full moon':
      return '🌕';
    case 'waning gibbous':
      return '🌖';
    case 'last quarter':
      return '🌗';
    case 'waning crescent':
      return '🌘';
    default:
      return '🌑';
  }
}