import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css';
import Dashboard from './dashboard/dashboard';
import FoliosImss from './FoliosImss/FoliosImss';
import MainPrivados from './Privados/mainPrivados';


function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Validación simple de prueba
    if (usuario === 'admin' && password === '1234') {
      navigate('/dashboard');
      localStorage.setItem('user_name', 'Administrador Sistema');
      localStorage.setItem('user_id', 'USR-001');
    } else {
      alert('Usuario o contraseña incorrectos (Prueba con admin / 1234)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050a18] font-sans">
      <div className="bg-[#111827] p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-800">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-[#f23c4d] p-3 rounded-xl">
            <span className="text-white text-3xl">🚑</span>
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">CECOM OS</h1>
            <p className="text-gray-400 text-sm">Terapia Móvil Ambulancias</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full bg-[#1f2937] border border-gray-700 text-white p-4 rounded-xl focus:outline-none focus:border-blue-500"
          />
          <input 
            type="password" 
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1f2937] border border-gray-700 text-white p-4 rounded-xl focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="w-full bg-[#e5e7eb] hover:bg-white text-[#111827] font-bold py-4 rounded-xl transition-all">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/folios-imss" element={<FoliosImss />}/>
        <Route path="/privados" element={<MainPrivados />}/>
      </Routes>
    </Router>
  );
}

export default App;