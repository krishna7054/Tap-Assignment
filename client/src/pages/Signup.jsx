import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    await axios.post('/api/auth/signup', { email, password });
    nav('/login');
  };
  return (
    <form onSubmit={submit} className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-2xl">Signup</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border" />
      <button type="submit" className="bg-green-600 text-white px-4 py-2">Signup</button>
      <p>Or <Link to="/login" className="text-blue-500">Login</Link></p>
    </form>
  );
}
