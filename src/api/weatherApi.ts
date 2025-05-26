import axios from 'axios';

// Weather API constants
const WEATHER_API_KEY = '74aa2d296b6c451782161002252405';
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';
const DEFAULT_LOCATION = 'salitre ecuador';

// Types
export interface WeatherData {
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    precip_mm: number;
    humidity: number;
    feelslike_c: number;
    uv: number;
  };
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
}

export interface ForecastData {
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        totalPrecip_mm: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
      };
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase: string;
        moon_illumination: string;
      };
      hour: Array<{
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        precip_mm: number;
        humidity: number;
      }>;
    }>;
  };
}

// Get current weather
export const getCurrentWeather = async (): Promise<WeatherData> => {
  try {
    const response = await axios.get(`${WEATHER_API_BASE_URL}/current.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: DEFAULT_LOCATION,
        aqi: 'no',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

// Get forecast for several days
export const getWeatherForecast = async (days: number = 7): Promise<ForecastData> => {
  try {
    const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: DEFAULT_LOCATION,
        days,
        aqi: 'no',
        alerts: 'no',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};