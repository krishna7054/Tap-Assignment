import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './pages/AuthForm';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import { getToken } from './utils/auth';

export default function App() {
  const token = getToken();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/" element={token ? <Dashboard /> : <Navigate to="/auth" />} />
        <Route path="/history" element={token ? <History /> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}
