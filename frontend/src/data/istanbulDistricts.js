// Approximate center + catchment radius (km) for each of Istanbul's 39
// districts. Used only to bucket map points by district so the Map page
// never has to render all ~13,000 points at once — user picks a district,
// we filter to that circle, then render just those.
export const ISTANBUL_DISTRICTS = [
  { name: 'Adalar', lat: 40.8767, lon: 29.0864, radius_km: 3 },
  { name: 'Arnavutköy', lat: 41.1858, lon: 28.7406, radius_km: 14 },
  { name: 'Ataşehir', lat: 40.9923, lon: 29.1244, radius_km: 3.5 },
  { name: 'Avcılar', lat: 40.9793, lon: 28.7215, radius_km: 4.5 },
  { name: 'Bağcılar', lat: 41.0381, lon: 28.8564, radius_km: 3.5 },
  { name: 'Bahçelievler', lat: 41.0022, lon: 28.8586, radius_km: 3 },
  { name: 'Bakırköy', lat: 40.9819, lon: 28.8772, radius_km: 3.5 },
  { name: 'Başakşehir', lat: 41.0949, lon: 28.8014, radius_km: 7 },
  { name: 'Bayrampaşa', lat: 41.0473, lon: 28.9153, radius_km: 2.5 },
  { name: 'Beşiktaş', lat: 41.0422, lon: 29.0093, radius_km: 3 },
  { name: 'Beykoz', lat: 41.1354, lon: 29.0904, radius_km: 12 },
  { name: 'Beylikdüzü', lat: 41.0009, lon: 28.6408, radius_km: 4 },
  { name: 'Beyoğlu', lat: 41.0370, lon: 28.9770, radius_km: 2.5 },
  { name: 'Büyükçekmece', lat: 41.0203, lon: 28.5850, radius_km: 7.5 },
  { name: 'Çatalca', lat: 41.1436, lon: 28.4606, radius_km: 21 },
  { name: 'Çekmeköy', lat: 41.0353, lon: 29.1908, radius_km: 8 },
  { name: 'Esenler', lat: 41.0446, lon: 28.8756, radius_km: 3 },
  { name: 'Esenyurt', lat: 41.0347, lon: 28.6789, radius_km: 4.5 },
  { name: 'Eyüpsultan', lat: 41.0483, lon: 28.9339, radius_km: 10 },
  { name: 'Fatih', lat: 41.0186, lon: 28.9498, radius_km: 2.5 },
  { name: 'Gaziosmanpaşa', lat: 41.0669, lon: 28.9153, radius_km: 2.5 },
  { name: 'Güngören', lat: 41.0175, lon: 28.8756, radius_km: 2.5 },
  { name: 'Kadıköy', lat: 40.9833, lon: 29.0333, radius_km: 3.5 },
  { name: 'Kağıthane', lat: 41.0791, lon: 28.9736, radius_km: 2.5 },
  { name: 'Kartal', lat: 40.9061, lon: 29.1897, radius_km: 4 },
  { name: 'Küçükçekmece', lat: 41.0000, lon: 28.7833, radius_km: 4 },
  { name: 'Maltepe', lat: 40.9350, lon: 29.1553, radius_km: 4.5 },
  { name: 'Pendik', lat: 40.8772, lon: 29.2350, radius_km: 8.5 },
  { name: 'Sancaktepe', lat: 41.0011, lon: 29.2331, radius_km: 5 },
  { name: 'Sarıyer', lat: 41.1667, lon: 29.0500, radius_km: 8 },
  { name: 'Silivri', lat: 41.0736, lon: 28.2464, radius_km: 19 },
  { name: 'Sultanbeyli', lat: 40.9683, lon: 29.2661, radius_km: 3.5 },
  { name: 'Sultangazi', lat: 41.1067, lon: 28.8672, radius_km: 4 },
  { name: 'Şile', lat: 41.1753, lon: 29.6117, radius_km: 17 },
  { name: 'Şişli', lat: 41.0603, lon: 28.9878, radius_km: 2.5 },
  { name: 'Tuzla', lat: 40.8144, lon: 29.3006, radius_km: 5 },
  { name: 'Ümraniye', lat: 41.0161, lon: 29.1247, radius_km: 4.5 },
  { name: 'Üsküdar', lat: 41.0225, lon: 29.0244, radius_km: 4 },
  { name: 'Zeytinburnu', lat: 40.9950, lon: 28.9058, radius_km: 2.5 },
];

// Haversine distance in km between two lat/lon points.
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Returns true if (lat, lon) falls inside the given district's catchment circle.
export function isInDistrict(lat, lon, district) {
  return distanceKm(lat, lon, district.lat, district.lon) <= district.radius_km;
}