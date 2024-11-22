import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import ProductListJS from '../pages/ProductListJS';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      localStorage.setItem('token', response.data.token);
      const user = JSON.parse(atob(response.data.token.split('.')[1]));
      navigate(user.isAdmin ? '/admin' : '/user');
    } catch (error) {
      console.error('Erro no login', error);
    }
  };


  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className='login-form'>
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
        <button type="submit">Login</button>
        <Link to="/register">
          <button>Não tem conta? cadraste-se</button>
        </Link>
      </form>
      <h1>Faça login para comprar nossos maravilhosos Sushis!!!</h1>
      <h2>Olhe nossas opções:</h2>
      <ProductListJS />
    </div>
  );
}

export default Login;