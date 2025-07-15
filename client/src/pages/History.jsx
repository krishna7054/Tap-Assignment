import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { authHeaders } from '../utils/auth';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const loader = useRef(null);
  const page = useRef(1);

  const fetchSessions = () => {
    axios
      .get(`http://localhost:5000/api/sessions?page=${page.current}`, { headers: authHeaders() })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setSessions((s) => [...s, ...res.data]);
          page.current++;
        }
      })
      .catch((err) => console.error('Error fetching sessions:', err));
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchSessions();
        }
      },
      { threshold: 1 }
    );

    const currentLoader = loader.current;
    if (currentLoader) obs.observe(currentLoader);

    return () => {
      if (currentLoader) obs.unobserve(currentLoader);
    };
  }, []);

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-2xl font-bold mb-4">🏃 Past Jogging Sessions</h2>

      {sessions.length === 0 && (
        <p className="text-gray-500">No sessions yet.</p>
      )}

      {sessions.map((s, i) => {
        const formattedDate = s.date ? new Date(s.date).toLocaleString() : 'Unknown Date';
        const distance = typeof s.distance === 'number' ? (s.distance / 1000).toFixed(2) : '0.00';
        const duration = s.duration ?? 0;
        const speed = (s.averageSpeed ?? 0).toFixed(2);

        return (
          <div
            key={s._id || i}
            className="p-4 bg-white shadow-md rounded border space-y-1"
          >
            <p><strong>Date:</strong> {formattedDate}</p>
            <p><strong>Distance:</strong> {distance} km</p>
            <p><strong>Duration:</strong> {duration} seconds</p>
            <p><strong>Avg Speed:</strong> {speed} m/s</p>
          </div>
        );
      })}

      <div ref={loader} className="text-center text-gray-400 mt-4">
        Loading more...
      </div>
    </div>
  );
}
