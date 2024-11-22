import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductList from './ProductList';


function UserDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <h1>Dashboard do Usuário</h1>
      <p>Bem-vindo à sua área de usuário!</p>
      <button onClick={handleLogout} className='btnlogout'>Logout</button>
      <ProductList/>
    </div>
  );
}

export default UserDashboard;