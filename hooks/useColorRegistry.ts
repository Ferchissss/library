// hooks/useColorRegistry.ts
import { useState, useMemo } from 'react';

export const useColorRegistry = () => {
  const [colorAssignments] = useState<Map<string, number>>(new Map());
  
  const getColorIndex = (value: string, field: string, allValues: string[]) => {
    const key = `${field}:${value}`;
    
    // Si ya tiene un color asignado, lo devolvemos
    if (colorAssignments.has(key)) {
      return colorAssignments.get(key)!;
    }
    
    // Si no, le asignamos el próximo color disponible en orden
    const sortedValues = [...new Set(allValues)].sort();
    const valueIndex = sortedValues.indexOf(value);
    const colorIndex = valueIndex % AVAILABLE_COLORS.length;
    
    colorAssignments.set(key, colorIndex);
    return colorIndex;
  };
  
  return { getColorIndex };
};