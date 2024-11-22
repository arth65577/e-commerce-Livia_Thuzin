import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', { email, password, isAdmin });
      navigate('/login');
    } catch (error) {
      console.error('Erro no registro', error);
    }
  };

  return (
    <div className='register-page'>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit} className='register-form'>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
        />
        <label>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          Administrador
        </label>
        <button type="submit">Registrar</button>
        <Link to="/login">
        <button>Já tem conta? logar-se</button>
      </Link>
      </form>
      
    </div>
  );
}

export default Register;