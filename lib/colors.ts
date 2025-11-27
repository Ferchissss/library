// lib/colorUtils.ts
export const AVAILABLE_COLORS = [
  { bg: "#ffe4e6", text: "text-rose-800", border: "border-rose-300", hex: "#9f1239" },
  { bg: "#fae8ff", text: "text-fuchsia-800", border: "border-fuchsia-300", hex: "#86198f" },
  { bg: "#e0e7ff", text: "text-indigo-800", border: "border-indigo-300", hex: "#3730a3" },
  { bg: "#e0f2fe", text: "text-sky-800", border: "border-sky-300", hex: "#075985" },
  { bg: "#ccfbf1", text: "text-teal-800", border: "border-teal-300", hex: "#115e59" },
  { bg: "#ecfccb", text: "text-lime-800", border: "border-lime-300", hex: "#3f6212" },
  { bg: "#ffedd5", text: "text-orange-800", border: "border-orange-300", hex: "#9a3412" },
  { bg: "#f3f4f6", text: "text-gray-800", border: "border-gray-300", hex: "#1f2937" },
] as const;

// Mapa global para mantener el orden de colores por columna
const colorAssignmentMap = new Map<string, Map<string, number>>();

export const getConsistentColorIndex = (value: string, columnId: string, totalColors: number): number => {
  if (!value) return 0;
  
  // Inicializar el mapa para esta columna si no existe
  if (!colorAssignmentMap.has(columnId)) {
    colorAssignmentMap.set(columnId, new Map());
  }
  
  const columnMap = colorAssignmentMap.get(columnId)!;
  
  // Si el valor ya tiene un color asignado, devolverlo
  if (columnMap.has(value)) {
    return columnMap.get(value)!;
  }
  
  // Si no, asignar el próximo color disponible en orden
  const nextIndex = columnMap.size % totalColors;
  columnMap.set(value, nextIndex);
  
  return nextIndex;
};

// Función específica para iconos
export const getIconColor = (iconName: string): string => {
  const colorIndex = getConsistentColorIndex(iconName, 'icons', AVAILABLE_COLORS.length);
  return AVAILABLE_COLORS[colorIndex].hex;
};

// Función genérica para obtener colores con estilo en línea
export const getColorStyle = (value: string, columnId: string): { bg: string, text: string } => {
  const colorIndex = getConsistentColorIndex(value, columnId, AVAILABLE_COLORS.length);
  const color = AVAILABLE_COLORS[colorIndex];
  
  return {
    bg: color.bg,
    text: color.hex
  };
};

// Función específica para continentes
export const getContinentColor = (continent: string): { bg: string, text: string } => {
  return getColorStyle(continent, 'continents');
};

// Función específica para géneros de autor
export const getAuthorGenreColor = (genre: string): { bg: string, text: string } => {
  return getColorStyle(genre, 'author_genres');
};

// Función para género del autor (female=rosa, male=azul)
export const getGenderColor = (gender: string | undefined): { bg: string, text: string } => {
  const genderColors = {
    'Female': { bg: '#fce7f3', text: '#831843' },
    'Male': { bg: '#dbeafe', text: '#1e3a8a' }
  };
  
  return genderColors[gender as keyof typeof genderColors] || { bg: '#f3f4f6', text: '#374151' };
};

export const getGenreColor = (genreName: string): string => {
  const colorIndex = getConsistentColorIndex(genreName, 'genres', AVAILABLE_COLORS.length);
  return AVAILABLE_COLORS[colorIndex].bg;
};

// Función para resetear el mapa si es necesario (opcional)
export const resetColorAssignments = () => {
  colorAssignmentMap.clear();
};