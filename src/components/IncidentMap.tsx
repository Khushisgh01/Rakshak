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

function AutoFitBounds({ incidents }: { incidents: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (incidents.length === 0) return;
    const bounds = L.latLngBounds(incidents.map(i => i.position));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [incidents, map]);
  return null;
}

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
  
  const [fireIncidents, setFireIncidents] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        console.log("📡 Attempting to connect to stream...");
        // Use 127.0.0.1 to match your Django console output
        const res = await fetch("http://127.0.0.1:8000/stream/cameras/", {
          signal: abortController.signal
        });

        if (!res.body) {
          console.error("❌ No response body received");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || ""; 

          const newIncidents: any[] = [];

          for (const line of lines) {
            const t = line.trim();
            if (!t) continue;
            // Inside your for (const line of lines) loop, BEFORE the try/catch
console.log("RAW LINE:", line);

            try {
              const obj = JSON.parse(t);
              console.log("📦 Received Object:", obj); // THIS WILL SHOW IN YOUR CONSOLE NOW

              // Handle the initial connection message
              if (obj.status === 'initialising_all') {
                console.log(`✅ Connection established. Tracking ${obj.camera_count} cameras.`);
                continue; 
              }

              // Handle frame data
              if (obj.status === "frame" && obj.camera_latitude && obj.camera_longitude) {
                const lat = parseFloat(obj.camera_latitude);
                const lng = parseFloat(obj.camera_longitude);

                if (!isNaN(lat) && !isNaN(lng)) {
  const fireAlert = obj.models?.fire?.detected;

const accidentAlert = obj.models?.accident?.detections?.some(
  (d: any) => d.confidence >= 0.85
);

const hasAlert = fireAlert || accidentAlert;

  if (hasAlert) { // <--- Ye filter add karne se sirf Alerts dikhenge
    newIncidents.push({
      id: obj.camera_id, 
      position: [lat, lng],
      title: `ALERT: Camera #${obj.camera_id}`,
      isAlert: true
    });
  }
}
              }
            } catch (e) {
              console.warn("⚠️ Parse error on line:", t);
            }
          }

          if (newIncidents.length > 0 && isMounted) {
            setFireIncidents((prev) => {
              const map = new Map(prev.map(i => [i.id, i]));
              newIncidents.forEach(i => map.set(i.id, i));
              return Array.from(map.values());
            });
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("❌ Connection Error:", err);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  return (
    <div style={{ height: "600px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
      <AutoFitBounds incidents={fireIncidents} />
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