  import React, { useState, useRef, useEffect} from 'react';
import axios from 'axios';
import { authHeaders, clearToken } from '../utils/auth';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button"
import { LogOut, AlertTriangle, History, Square, Play } from "lucide-react"
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 17);
  }, [position, map]);
  return null;
}

export default function Dashboard() {
  const [coords, setCoords] = useState([]);
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState('Checking...');
  const watchRef = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const nav=useNavigate();

  const calcDistance = (a, b) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (a.lat * Math.PI) / 180;
    const φ2 = (b.lat * Math.PI) / 180;
    const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
    const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
    const aVal = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  };

  useEffect(() => {
    const conn = navigator.connection;
    if (conn) {
      const updateStatus = () => {
        setStatus(conn.effectiveType.includes('2g') ? 'Poor connection' : 'Connected');
      };
      conn.addEventListener('change', updateStatus);
      updateStatus();
      return () => conn.removeEventListener('change', updateStatus);
    } else {
      setStatus('Connection status unavailable');
    }
  }, []);

  useEffect(() => {
    // Cleanup geolocation watch and interval on component unmount
    return () => {
      if (watchRef.current) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const start = () => {
     setIsTracking(true); 
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setCoords([]);
    setDistance(0);
    setLocationError(null);
    const start = Date.now();
    setStartTime(start);
    setElapsed(0);

    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    const tryGeolocation = (highAccuracy = true) => {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setCoords((prev) => {
            const updated = [...prev, { lat, lng }];
            if (prev.length > 0) {
              setDistance((d) => d + calcDistance(prev[prev.length - 1], { lat, lng }));
            }
            drawOnCanvas(updated);
            return updated;
          });
          setLocationError(null); // Clear error on success
        },
        (err) => {
          console.error('Geolocation error:', err);
          let errorMessage = 'Location Error: ';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage += 'Permission denied. Please allow location access in your browser settings.';
              setLocationError(errorMessage);
              break;
            case err.POSITION_UNAVAILABLE:
              if (highAccuracy) {
                // Retry with low accuracy if high accuracy fails
                console.log('Retrying with low accuracy...');
                navigator.geolocation.clearWatch(watchRef.current);
                tryGeolocation(false); // Retry with enableHighAccuracy: false
              } else {
                errorMessage +=
                  'Location information is unavailable. Ensure location services are enabled and try moving to an area with better GPS or Wi-Fi signal.';
                setLocationError(errorMessage);
              }
              break;
            case err.TIMEOUT:
              errorMessage += 'The request to get location timed out. Try again or check your connection.';
              setLocationError(errorMessage);
              break;
            default:
              errorMessage += err.message || 'An unknown error occurred.';
              setLocationError(errorMessage);
          }
          if (err.code !== err.POSITION_UNAVAILABLE || !highAccuracy) {
            alert(errorMessage);
          }
        },
        {
          enableHighAccuracy: highAccuracy,
          maximumAge: 1000,
          timeout: 20000,
        }
      );
    };

    tryGeolocation(true); // Start with high accuracy
  };

  const stop = async () => {
    setIsTracking(false);
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!startTime || coords.length < 2) {
      alert('Insufficient data to save session.');
      return;
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);
    const avgSpeed = distance / duration;

    try {
      await axios.post(
        'http://localhost:5000/api/sessions',
        { path: coords, distance, duration, averageSpeed: avgSpeed },
        { headers: authHeaders() }
      );
      alert('Session saved!');
    } catch (err) {
      alert('Failed to save session.');
      console.error(err);
    }
  };

  const sos = () => {
    if (!coords.length) return alert('Location not tracked yet!');
    const { lat, lng } = coords.at(-1);
    window.open(`https://wa.me/?text=Emergency! I am here: https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  const drawOnCanvas = (path) => {
    const canvas = canvasRef.current;
    if (!canvas || path.length < 2) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    const scale = 50000;
    const startX = canvas.width / 2;
    const startY = canvas.height / 2;
    ctx.moveTo(startX, startY);
    path.reduce((prev, curr) => {
      const dx = (curr.lng - prev.lng) * scale;
      const dy = (curr.lat - prev.lat) * -scale;
      ctx.lineTo(startX + dx, startY + dy);
      return curr;
    }, path[0]);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const history =()=>{
    nav("/history");
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="flex justify-between items-center py-4">
        <h1 className="font-bold text-gray-900 italic text-sm md:text-2xl  ">🏃 Jogging <span className='text-blue-600 font-serif'>Tracker</span></h1>
        <div className='flex items-center gap-2 md:gap-4'>
         <Button   variant="destructive" onClick={sos} className="bg-red-600 hover:bg-red-700 ">
           <AlertTriangle className="w-4 h-4 " />
          SOS
        </Button>
        <Button variant="outline"
          className="text-black "
          onClick={() => {
            clearToken();
            window.location.reload();
          }}
        >
           <LogOut className="w-4 h-4 " />
          Logout
        </Button>
        </div>
      </div>
          <div className='flex justify-between py-2 '>
      <div className='gap-2 inline-flex'>
        Status: <strong>{status}</strong>
         <div className="w-3 h-3 mt-1.5 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      <Button variant="secondary" onClick={()=>history()}>
        <History  className="w-4 h-4 "/>
        History</Button>
</div>

      {locationError && (
        <p className="text-red-600">
          {locationError}
          <br />
          <button
            onClick={() => start()}
            className="text-blue-600 underline"
          >
            Retry
          </button>
        </p>
      )}

       <Card >
        <CardHeader>
          <CardTitle>Route Map</CardTitle>
          <CardDescription>Your jogging path will be drawn here</CardDescription>
        </CardHeader>
        <CardContent>
      <MapContainer center={[20, 78]} zoom={15} className="h-80 w-full z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {coords.length > 1 && <Polyline positions={coords.map((p) => [p.lat, p.lng])} color="blue" />}
        {coords.length > 0 && <MapUpdater position={[coords.at(-1).lat, coords.at(-1).lng]} />}
      </MapContainer>
      <canvas ref={canvasRef} width="400" height="100" className="border mt-3" />
       <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Path</span>
            </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-center m-4">
         {!isTracking ? (
              <Button onClick={start} className="flex-1 max-w-xs">
                <Play className="w-4 h-4 mr-2" />
                Start Session
              </Button>
              
              ) : (
                <Button onClick={stop} variant="destructive" className="flex-1 max-w-xs">
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
    
          </div>

      <p>⏱ Elapsed Time: {elapsed}s</p>
      <p>📏 Distance: {(distance / 1000).toFixed(2)} km</p>
    </div>
  );
}



