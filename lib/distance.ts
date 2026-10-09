import centers from '../data/location-centers.json' with { type: 'json' };

export const DISTANCE_STEPS = [0, 5, 10, 20, 30] as const;
const origin = centers.find(city => city.name === 'Dortmund')!;
const radians = (degrees: number) => degrees * Math.PI / 180;

function normalize(value: string) {
  return value.toLocaleLowerCase('de').replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue').replaceAll('ß', 'ss');
}

export function distanceFromDortmund(location: string): number | null {
  // Resolve the start of each listed workplace, not city names inside street names.
  const places = normalize(location).split(/\s*[/;,|]\s*|\s+und\s+/);
  const matches = centers.filter(city => places.some(place => {
    const name = normalize(city.name);
    const text = place.trim().replace(/^\d{5}\s+/, '');
    return text === name || text.startsWith(name + ' ') || text.startsWith(name + '-') || text.startsWith(name + '(');
  }));
  if (!matches.length) return null;
  return Math.min(...matches.map(city => {
    const a = Math.sin(radians(city.latitude - origin.latitude) / 2) ** 2
      + Math.cos(radians(origin.latitude)) * Math.cos(radians(city.latitude))
      * Math.sin(radians(city.longitude - origin.longitude) / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }));
}

export function withinDistance(location: string, radius: number, includeUnknown = false) {
  const distance = distanceFromDortmund(location);
  return distance === null ? includeUnknown : distance <= radius;
}

export function distanceLabel(location: string) {
  const distance = distanceFromDortmund(location);
  return distance === null ? 'Entfernung unbekannt' : distance === 0 ? 'Dortmund' : `ca. ${Math.round(distance)} km Luftlinie`;
}
