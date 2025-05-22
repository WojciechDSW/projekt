import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', { email, password });
      navigate('/login');
    } catch (error) {
      alert('Błąd rejestracji');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-2xl mb-4">Rejestracja</h2>
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
        Zarejestruj
      </button>
      <p className="mt-2">
        Masz konto? <a href="/login" className="text-blue-500">Zaloguj się</a>
      </p>
    </form>
  );
};

export default Register;