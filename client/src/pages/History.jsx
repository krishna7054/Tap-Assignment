import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { authHeaders } from '../utils/auth';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const loader = useRef(null);
  const page = useRef(1);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        axios.get(`/api/sessions?page=${page.current}`, { headers: authHeaders() })
          .then(res => { setSessions(s=>[...s, ...res.data]); page.current++; });
      }
    }, { threshold: 1 });
    if (loader.current) obs.observe(loader.current);
  }, []);

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-2xl">History</h2>
      {sessions.map((s,i) => (
        <div key={i} className="p-2 border">
          {new Date(s.date).toLocaleString()} — {(s.distance/1000).toFixed(2)} km
        </div>
      ))}
      <div ref={loader} className="text-center">Loading more...</div>
    </div>
  );
}
