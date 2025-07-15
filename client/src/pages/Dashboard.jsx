import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { authHeaders, clearToken } from '../utils/auth';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Dashboard() {
  const [coords, setCoords] = useState([]);
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [status, setStatus] = useState('Connected');
  const watchRef = useRef(null);

  const calcDistance = (a, b) => {
    const R = 6371e3;
    const φ1 = a.lat * Math.PI/180;
    const φ2 = b.lat * Math.PI/180;
    const Δφ = (b.lat - a.lat) * Math.PI/180;
    const Δλ = (b.lng - a.lng) * Math.PI/180;
    const aVal = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    const d = R * c;
    return d;
  };

  useEffect(() => {
    const conn = navigator.connection;
    if (conn) {
      conn.addEventListener('change', () => {
        setStatus(conn.effectiveType.includes('2g') ? 'Poor connection' : 'Connected');
      });
    }
  }, []);

  const start = () => {
    setStartTime(Date.now());
    watchRef.current = navigator.geolocation.watchPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setCoords(prev => {
        if (prev.length) {
          setDistance(d => d + calcDistance(prev[prev.length-1], { lat, lng }));
        }
        return [...prev, { lat, lng }];
      });
    }, err => alert(err.message), { enableHighAccuracy: true });
  };

  const stop = async () => {
    navigator.geolocation.clearWatch(watchRef.current);
    const duration = Math.floor((Date.now() - startTime)/1000);
    const avgSpeed = distance / duration;
    await axios.post('/api/sessions', { path: coords, distance, duration, averageSpeed: avgSpeed }, { headers: authHeaders() });
  };

  const sos = () => {
    if (!coords.length) return;
    const { lat, lng } = coords.at(-1);
    window.open(`https://wa.me/?text=I am here: https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Dashboard</h1>
        <button className="text-red-600" onClick={() => { clearToken(); window.location.reload(); }}>Logout</button>
      </div>
      <p>Status: <strong>{status}</strong></p>
      <MapContainer center={[20,78]} zoom={5} className="h-80">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coords.length > 1 && <Polyline positions={coords.map(p=>[p.lat,p.lng])} />}
      </MapContainer>
      <canvas id="canvas" width="400" height="100" className="border"></canvas>
      <div className="flex space-x-2">
        <button onClick={start} className="bg-green-600 px-4 py-2 text-white">Start</button>
        <button onClick={stop} className="bg-yellow-600 px-4 py-2 text-white">Stop</button>
        <button onClick={sos} className="bg-red-600 px-4 py-2 text-white">SOS</button>
      </div>
      <p>Distance: {(distance/1000).toFixed(2)} km</p>
      <p>Elapsed: {startTime ? Math.floor((Date.now()-startTime)/1000) : 0}s</p>
    </div>
  );
}
