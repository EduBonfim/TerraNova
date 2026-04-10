/**
 * Utilitários para cálculos geográficos e coordenadas.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Converte graus em radianos.
 */
export function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

/**
 * Calcula a distância entre dois pontos em KM usando a fórmula de Haversine.
 */
export function getDistanceKm(start: Coordinates, end: Coordinates): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(end.latitude - start.latitude);
  const dLng = toRadians(end.longitude - start.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(start.latitude)) *
      Math.cos(toRadians(end.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

/**
 * Retorna um label formatado (Ex: "1.5 km de você").
 */
export function formatDistanceLabel(distanceKm: number | null | undefined): string {
  if (distanceKm == null) return "Distância indisponível";
  return `${distanceKm.toFixed(1)} km de você`;
}

/**
 * Calcula um "score" simples de distância para ordenação (Pitágoras).
 * Útil para ordenação rápida sem precisar de Haversine completo.
 */
export function getDistanceScore(p1: Coordinates, p2: Coordinates): number {
  const latDiff = p1.latitude - p2.latitude;
  const lngDiff = p1.longitude - p2.longitude;
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}
