export const AVAILABLE_COLORS = [
  { bg: "#ffe4e6", text: "text-rose-800", border: "border-rose-300" },
  { bg: "#fae8ff", text: "text-fuchsia-800", border: "border-fuchsia-300" },
  { bg: "#e0e7ff", text: "text-indigo-800", border: "border-indigo-300" },
  { bg: "#e0f2fe", text: "text-sky-800", border: "border-sky-300" },
  { bg: "#ccfbf1", text: "text-teal-800", border: "border-teal-300" },
  { bg: "#ecfccb", text: "text-lime-800", border: "border-lime-300" },
  { bg: "#ffedd5", text: "text-orange-800", border: "border-orange-300" },
  { bg: "#f3f4f6", text: "text-gray-800", border: "border-gray-300" },
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

// Función para resetear el mapa si es necesario (opcional)
export const resetColorAssignments = () => {
  colorAssignmentMap.clear();
};