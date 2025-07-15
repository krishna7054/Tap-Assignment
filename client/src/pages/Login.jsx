import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { setToken } from '../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    const res = await axios.post('/api/auth/login', { email, password });
    setToken(res.data.token);
    nav('/');
  };
  return (
    <form onSubmit={submit} className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-2xl">Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2">Login</button>
      <p>Or <Link to="/signup" className="text-blue-500">Signup</Link></p>
    </form>
  );
}
