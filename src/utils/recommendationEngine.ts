import { LunarPhaseDay } from '../api/lunarApi';
import { ForecastData } from '../api/weatherApi';

// Types
export interface ActivityRecommendation {
  activity: string;
  isRecommended: boolean;
  reason: string;
  icon: string;
}

export interface CropRecommendation {
  cropId: string;
  cropName: string;
  isRecommended: boolean;
  recommendationLevel: number; // 0-100
  reason: string;
}

export interface DailyRecommendation {
  date: string;
  lunarPhase: string;
  weatherCondition: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  activities: ActivityRecommendation[];
  recommendedCrops: CropRecommendation[];
}

// Activity types
const ACTIVITIES = {
  PLANT: {
    id: 'plant',
    name: 'Sembrar',
    icon: '🌱',
  },
  WATER: {
    id: 'water',
    name: 'Regar',
    icon: '💧',
  },
  PRUNE: {
    id: 'prune',
    name: 'Podar',
    icon: '✂️',
  },
  HARVEST: {
    id: 'harvest',
    name: 'Cosechar',
    icon: '🧺',
  },
  FERTILIZE: {
    id: 'fertilize',
    name: 'Abonar',
    icon: '💩',
  },
  WEED: {
    id: 'weed',
    name: 'Desherbar',
    icon: '🌿',
  },
};

// Crop details with their optimal conditions
export const CROPS = [
  {
    id: 'arroz',
    name: 'Arroz',
    icon: '🌾',
    optimalTemperature: { min: 22, max: 32 },
    optimalHumidity: { min: 60, max: 85 },
    optimalLunarPhases: ['Luna Creciente'],
    waterNeeds: 'alta',
    description: 'Cereal básico en la alimentación ecuatoriana. En Salitre se cultiva principalmente en tierras bajas inundables.',
  },
  {
    id: 'banano',
    name: 'Banano',
    icon: '🍌',
    optimalTemperature: { min: 20, max: 35 },
    optimalHumidity: { min: 70, max: 90 },
    optimalLunarPhases: ['Luna Creciente', 'Cuarto Creciente'],
    waterNeeds: 'media-alta',
    description: 'Fruta tropical de gran importancia económica. Requiere suelos bien drenados y ricos en nutrientes.',
  },
  {
    id: 'cacao',
    name: 'Cacao',
    icon: '🍫',
    optimalTemperature: { min: 18, max: 32 },
    optimalHumidity: { min: 70, max: 100 },
    optimalLunarPhases: ['Luna Llena', 'Cuarto Creciente'],
    waterNeeds: 'media',
    description: 'El cacao fino de aroma ecuatoriano es reconocido mundialmente. Prefiere sombra parcial y suelos fértiles.',
  },
  {
    id: 'sandia',
    name: 'Sandía',
    icon: '🍉',
    optimalTemperature: { min: 23, max: 35 },
    optimalHumidity: { min: 65, max: 75 },
    optimalLunarPhases: ['Luna Creciente'],
    waterNeeds: 'media',
    description: 'Fruta refrescante que crece bien en climas cálidos. Necesita espacio para expandirse y suelos bien drenados.',
  },
  {
    id: 'soya',
    name: 'Soya',
    icon: '🫘',
    optimalTemperature: { min: 20, max: 30 },
    optimalHumidity: { min: 60, max: 80 },
    optimalLunarPhases: ['Luna Creciente', 'Cuarto Creciente'],
    waterNeeds: 'media-baja',
    description: 'Leguminosa rica en proteínas. Mejora la calidad del suelo fijando nitrógeno.',
  },
  {
    id: 'mango',
    name: 'Mango',
    icon: '🥭',
    optimalTemperature: { min: 24, max: 35 },
    optimalHumidity: { min: 40, max: 60 },
    optimalLunarPhases: ['Luna Creciente', 'Cuarto Creciente'],
    waterNeeds: 'media',
    description: 'Fruta tropical dulce muy apreciada. Los árboles pueden vivir más de 100 años produciendo frutos.',
  },
  {
    id: 'maiz',
    name: 'Maíz',
    icon: '🌽',
    optimalTemperature: { min: 18, max: 32 },
    optimalHumidity: { min: 50, max: 75 },
    optimalLunarPhases: ['Luna Creciente'],
    waterNeeds: 'media',
    description: 'Cereal básico en la alimentación ecuatoriana. Versátil en su uso, desde alimentación hasta forraje.',
  },
  {
    id: 'verde',
    name: 'Plátano Verde',
    icon: '🍌',
    optimalTemperature: { min: 20, max: 35 },
    optimalHumidity: { min: 70, max: 90 },
    optimalLunarPhases: ['Luna Creciente', 'Cuarto Creciente'],
    waterNeeds: 'alta',
    description: 'Variedad de plátano consumido principalmente cocinado. Base de platos tradicionales como el bolón.',
  },
];

// Generate recommendations based on lunar phase and weather
export const generateDailyRecommendations = (
  lunarData: LunarPhaseDay,
  forecastData: ForecastData['forecast']['forecastday'][0]
): DailyRecommendation => {
  const { phase, date } = lunarData;
  const { day, astro } = forecastData;
  
  const temperature = day.avgtemp_c;
  const humidity = 70; // Assumed average, ideally this should come from the API
  const precipitation = day.totalPrecip_mm;
  const weatherCondition = day.condition.text;
  
  // Generate activity recommendations
  const activities: ActivityRecommendation[] = [
    {
      activity: ACTIVITIES.PLANT.name,
      isRecommended: isPlantingRecommended(phase, temperature, precipitation),
      reason: getPlantingReason(phase, temperature, precipitation),
      icon: ACTIVITIES.PLANT.icon,
    },
    {
      activity: ACTIVITIES.WATER.name,
      isRecommended: isWateringRecommended(phase, precipitation),
      reason: getWateringReason(phase, precipitation),
      icon: ACTIVITIES.WATER.icon,
    },
    {
      activity: ACTIVITIES.PRUNE.name,
      isRecommended: isPruningRecommended(phase, precipitation),
      reason: getPruningReason(phase, precipitation),
      icon: ACTIVITIES.PRUNE.icon,
    },
    {
      activity: ACTIVITIES.HARVEST.name,
      isRecommended: isHarvestingRecommended(phase, precipitation),
      reason: getHarvestingReason(phase, precipitation),
      icon: ACTIVITIES.HARVEST.icon,
    },
    {
      activity: ACTIVITIES.FERTILIZE.name,
      isRecommended: isFertilizingRecommended(phase, precipitation),
      reason: getFertilizingReason(phase, precipitation),
      icon: ACTIVITIES.FERTILIZE.icon,
    },
    {
      activity: ACTIVITIES.WEED.name,
      isRecommended: isWeedingRecommended(phase, precipitation),
      reason: getWeedingReason(phase, precipitation),
      icon: ACTIVITIES.WEED.icon,
    },
  ];
  
  // Generate crop recommendations
  const recommendedCrops: CropRecommendation[] = CROPS.map(crop => {
    const recommendationLevel = calculateCropRecommendationLevel(
      crop, phase, temperature, humidity, precipitation
    );
    
    return {
      cropId: crop.id,
      cropName: crop.name,
      isRecommended: recommendationLevel > 60,
      recommendationLevel,
      reason: getCropRecommendationReason(crop, phase, temperature, precipitation),
    };
  });
  
  return {
    date,
    lunarPhase: phase,
    weatherCondition,
    temperature,
    humidity,
    precipitation,
    activities,
    recommendedCrops: recommendedCrops.sort((a, b) => b.recommendationLevel - a.recommendationLevel),
  };
};

// Helper functions to determine if activities are recommended
function isPlantingRecommended(lunarPhase: string, temperature: number, precipitation: number): boolean {
  // Best lunar phases for planting
  const goodPhases = ['Luna Creciente', 'Cuarto Creciente'];
  
  // Check if conditions are good
  const isGoodPhase = goodPhases.includes(lunarPhase);
  const isGoodTemperature = temperature >= 18 && temperature <= 32;
  const isNotRainingTooMuch = precipitation < 10;
  
  return isGoodPhase && isGoodTemperature && isNotRainingTooMuch;
}

function isWateringRecommended(lunarPhase: string, precipitation: number): boolean {
  // Avoid watering during rainy days
  if (precipitation > 5) return false;
  
  // Best lunar phases for watering
  const goodPhases = ['Luna Creciente', 'Cuarto Creciente', 'Gibosa Creciente'];
  
  return goodPhases.includes(lunarPhase);
}

function isPruningRecommended(lunarPhase: string, precipitation: number): boolean {
  // Don't prune when it's raining
  if (precipitation > 2) return false;
  
  // Best lunar phases for pruning
  const goodPhases = ['Luna Menguante', 'Cuarto Menguante'];
  
  return goodPhases.includes(lunarPhase);
}

function isHarvestingRecommended(lunarPhase: string, precipitation: number): boolean {
  // Don't harvest in heavy rain
  if (precipitation > 8) return false;
  
  // Best lunar phases for harvesting
  const goodPhases = ['Luna Llena', 'Gibosa Menguante'];
  
  return goodPhases.includes(lunarPhase);
}

function isFertilizingRecommended(lunarPhase: string, precipitation: number): boolean {
  // Don't fertilize when it's raining heavily
  if (precipitation > 10) return false;
  
  // Best lunar phases for fertilizing
  const goodPhases = ['Luna Creciente', 'Cuarto Creciente'];
  
  return goodPhases.includes(lunarPhase);
}

function isWeedingRecommended(lunarPhase: string, precipitation: number): boolean {
  // Don't weed when it's raining heavily
  if (precipitation > 15) return false;
  
  // Best lunar phases for weeding
  const goodPhases = ['Luna Menguante', 'Cuarto Menguante'];
  
  return goodPhases.includes(lunarPhase);
}

// Helper functions to get reasoning for recommendations
function getPlantingReason(lunarPhase: string, temperature: number, precipitation: number): string {
  if (precipitation > 10) {
    return 'Exceso de lluvia puede afectar la germinación de semillas.';
  }
  
  if (temperature < 18) {
    return 'Temperatura demasiado baja para la mayoría de cultivos.';
  }
  
  if (temperature > 32) {
    return 'Temperatura demasiado alta puede estresar las plántulas nuevas.';
  }
  
  const goodPhases = ['Luna Creciente', 'Cuarto Creciente'];
  if (!goodPhases.includes(lunarPhase)) {
    return `La fase ${lunarPhase} no es óptima para sembrar. Mejor esperar hasta Luna Creciente.`;
  }
  
  return 'Excelentes condiciones para sembrar. La fase lunar favorece el crecimiento y desarrollo de raíces.';
}

function getWateringReason(lunarPhase: string, precipitation: number): string {
  if (precipitation > 5) {
    return 'Hay suficiente lluvia natural, no es necesario regar.';
  }
  
  const goodPhases = ['Luna Creciente', 'Cuarto Creciente', 'Gibosa Creciente'];
  if (!goodPhases.includes(lunarPhase)) {
    return `En fase ${lunarPhase}, regar moderadamente para evitar pudrición.`;
  }
  
  return 'Buen momento para regar. Las plantas absorben agua más eficientemente en esta fase lunar.';
}

function getPruningReason(lunarPhase: string, precipitation: number): string {
  if (precipitation > 2) {
    return 'Evite podar con lluvia para prevenir enfermedades fungosas.';
  }
  
  const goodPhases = ['Luna Menguante', 'Cuarto Menguante'];
  if (!goodPhases.includes(lunarPhase)) {
    return `En fase ${lunarPhase}, la poda puede debilitar la planta. Mejor esperar a Luna Menguante.`;
  }
  
  return 'Excelente momento para podar. La planta sangrará menos y cicatrizará mejor.';
}

function getHarvestingReason(lunarPhase: string, precipitation: number): string {
  if (precipitation > 8) {
    return 'Evite cosechar con lluvia fuerte para mantener la calidad del producto.';
  }
  
  const goodPhases = ['Luna Llena', 'Gibosa Menguante'];
  if (!goodPhases.includes(lunarPhase)) {
    return `En fase ${lunarPhase}, los cultivos pueden tener menos sabor y menor tiempo de almacenamiento.`;
  }
  
  return 'Excelente momento para cosechar. Los cultivos tendrán mejor sabor y durarán más tiempo almacenados.';
}

function getFertilizingReason(lunarPhase: string, precipitation: number): string {
  if (precipitation > 10) {
    return 'Demasiada lluvia lavará los nutrientes. Mejor esperar a que esté más seco.';
  }
  
  const goodPhases = ['Luna Creciente', 'Cuarto Creciente'];
  if (!goodPhases.includes(lunarPhase)) {
    return `En fase ${lunarPhase}, las plantas absorben menos nutrientes. Mejor esperar a Luna Creciente.`;
  }
  
  return 'Buen momento para fertilizar. Las plantas absorberán los nutrientes eficientemente.';
}

function getWeedingReason(lunarPhase: string, precipitation: number): string {
  if (precipitation > 15) {
    return 'El suelo mojado dificulta la eliminación de malas hierbas y puede compactar el terreno.';
  }
  
  const goodPhases = ['Luna Menguante', 'Cuarto Menguante'];
  if (!goodPhases.includes(lunarPhase)) {
    return `En fase ${lunarPhase}, las malas hierbas vuelven a crecer más rápido si se arrancan.`;
  }
  
  return 'Excelente momento para eliminar malas hierbas. Arrancarlas en esta fase lunar reduce su regeneración.';
}

// Helper function to calculate crop recommendation level
function calculateCropRecommendationLevel(
  crop: typeof CROPS[0],
  lunarPhase: string,
  temperature: number,
  humidity: number,
  precipitation: number
): number {
  let score = 0;
  
  // Check lunar phase compatibility (30% of score)
  if (crop.optimalLunarPhases.includes(lunarPhase)) {
    score += 30;
  } else if (
    lunarPhase === 'Luna Creciente' || 
    lunarPhase === 'Cuarto Creciente'
  ) {
    score += 15; // Still decent phases for most crops
  }
  
  // Check temperature compatibility (40% of score)
  const { min: minTemp, max: maxTemp } = crop.optimalTemperature;
  if (temperature >= minTemp && temperature <= maxTemp) {
    score += 40;
  } else if (
    temperature >= minTemp - 3 && 
    temperature <= maxTemp + 3
  ) {
    score += 20; // Close to optimal range
  }
  
  // Check water needs vs precipitation (30% of score)
  if (
    (crop.waterNeeds === 'alta' && precipitation >= 5) ||
    (crop.waterNeeds === 'media-alta' && precipitation >= 3 && precipitation <= 10) ||
    (crop.waterNeeds === 'media' && precipitation >= 1 && precipitation <= 7) ||
    (crop.waterNeeds === 'media-baja' && precipitation >= 0 && precipitation <= 5) ||
    (crop.waterNeeds === 'baja' && precipitation < 3)
  ) {
    score += 30;
  } else if (
    (crop.waterNeeds === 'alta' && precipitation >= 2) ||
    (crop.waterNeeds === 'media-alta' && precipitation >= 1) ||
    (crop.waterNeeds === 'media' && precipitation <= 10) ||
    (crop.waterNeeds === 'media-baja' && precipitation <= 7) ||
    (crop.waterNeeds === 'baja' && precipitation <= 5)
  ) {
    score += 15; // Still acceptable water conditions
  }
  
  return score;
}

// Helper function to get crop recommendation reason
function getCropRecommendationReason(
  crop: typeof CROPS[0],
  lunarPhase: string,
  temperature: number,
  precipitation: number
): string {
  const { min: minTemp, max: maxTemp } = crop.optimalTemperature;
  
  // Check lunar phase
  const isGoodPhase = crop.optimalLunarPhases.includes(lunarPhase);
  
  // Check temperature
  const isGoodTemperature = temperature >= minTemp && temperature <= maxTemp;
  
  // Check precipitation
  let isGoodPrecipitation = false;
  
  switch (crop.waterNeeds) {
    case 'alta':
      isGoodPrecipitation = precipitation >= 5;
      break;
    case 'media-alta':
      isGoodPrecipitation = precipitation >= 3 && precipitation <= 10;
      break;
    case 'media':
      isGoodPrecipitation = precipitation >= 1 && precipitation <= 7;
      break;
    case 'media-baja':
      isGoodPrecipitation = precipitation >= 0 && precipitation <= 5;
      break;
    case 'baja':
      isGoodPrecipitation = precipitation < 3;
      break;
  }
  
  // Generate reason based on conditions
  if (isGoodPhase && isGoodTemperature && isGoodPrecipitation) {
    return `Condiciones ideales para ${crop.name}. Fase lunar, temperatura y humedad óptimas.`;
  }
  
  if (!isGoodPhase && isGoodTemperature && isGoodPrecipitation) {
    return `Temperatura y humedad ideales para ${crop.name}, pero mejor fase lunar sería ${crop.optimalLunarPhases.join(' o ')}.`;
  }
  
  if (isGoodPhase && !isGoodTemperature && isGoodPrecipitation) {
    return `Fase lunar y humedad buenas para ${crop.name}, pero la temperatura está fuera del rango óptimo (${minTemp}°C - ${maxTemp}°C).`;
  }
  
  if (isGoodPhase && isGoodTemperature && !isGoodPrecipitation) {
    return `Fase lunar y temperatura ideales para ${crop.name}, pero las condiciones de humedad no son óptimas.`;
  }
  
  if (!isGoodPhase && !isGoodTemperature && !isGoodPrecipitation) {
    return `Condiciones no favorables para ${crop.name}. Considere esperar a mejores condiciones.`;
  }
  
  return `Condiciones parcialmente favorables para ${crop.name}. Algunos factores no son óptimos.`;
}