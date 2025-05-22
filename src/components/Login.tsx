import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (error) {
      alert('Błąd logowania');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-2xl mb-4">Logowanie</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Hasło"
        className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
      />
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
        Zaloguj
      </button>
      <p className="mt-2">
        Nie masz konta? <a href="/register" className="text-blue-500">Zarejestruj się</a>
      </p>
    </form>
  );
};

export default Login;