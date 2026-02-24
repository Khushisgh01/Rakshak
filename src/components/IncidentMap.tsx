import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// 1. Fix default icon issue (standard Leaflet fix)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 2. CREATE A RED FIRE ICON
const fireIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/426/426833.png', // A fire icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

type LatLng = [number, number];

// 3. MULTIPLE DATA POINTS
const fireIncidents = [
  { id: 1, position: [28.6139, 77.2090] as LatLng, title: "Fire at Connaught Place" },
  { id: 2, position: [28.5244, 77.1855] as LatLng, title: "Short Circuit in Mehrauli" },
  { id: 3, position: [28.6500, 77.2300] as LatLng, title: "Chandni Chowk Incident" },
  { id: 4, position: [28.5672, 77.2433] as LatLng, title: "Lajpat Nagar Fire Alert" },
];

function RoutingMachine({ destination }: { destination: LatLng | null }) {
  const map = useMap();
  const routingRef = useRef<any>(null);

  useEffect(() => {
    if (!destination || !map) return;
    let control: any;

    navigator.geolocation.getCurrentPosition((position) => {
      const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
      const destLatLng = L.latLng(destination[0], destination[1]);

      if (routingRef.current) map.removeControl(routingRef.current);

      control = (L as any).Routing.control({
        waypoints: [userLatLng, destLatLng],
        lineOptions: { styles: [{ color: "red", weight: 6 }] },
        show: false,
        addWaypoints: false,
      }).addTo(map);
      
      routingRef.current = control;
    });

    return () => { if (control) map.removeControl(control); };
  }, [destination, map]);

  return null;
}

export default function IncidentMap() {
  const [destination, setDestination] = useState<LatLng | null>(null);

  return (
    <div style={{ height: "600px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* This loop renders all markers in the array */}
        {fireIncidents.map((incident) => (
          <Marker 
            key={incident.id} 
            position={incident.position} 
            icon={fireIcon} // Using the custom fire icon here
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ color: '#e11d48' }}>{incident.title}</strong>
                <br />
                <button 
                  onClick={() => setDestination(incident.position)}
                  style={{
                    marginTop: "8px",
                    backgroundColor: "#e11d48",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Navigate Now
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <RoutingMachine destination={destination} />
      </MapContainer>
    </div>
  );
}