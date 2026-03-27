// src/lib/geocoding.ts
export async function getAddressFromCoords(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await response.json();
    // Returns a full address, or a fallback if not found
    return data.display_name || "Location not found";
  } catch (error) {
    console.error("Geocoding failed:", error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; // Fallback to Lat/Long
  }
}