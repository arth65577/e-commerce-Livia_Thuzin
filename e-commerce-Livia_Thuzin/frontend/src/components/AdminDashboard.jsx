import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminProductList from './ProductListADM';
function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <h1>Dashboard do Administrador</h1>
      <p>Bem-vindo à área de administração!</p>
      <button onClick={handleLogout} className='btnlogout'>Logout</button>
      <AdminProductList/>
    </div>
  );
}

export default AdminDashboard;