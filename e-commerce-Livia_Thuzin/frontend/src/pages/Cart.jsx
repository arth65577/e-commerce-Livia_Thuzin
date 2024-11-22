import React, { useState, useEffect } from 'react';
import axios from 'axios';


function Cart({ userId }) {
  const [cartItems, setCartItems] = useState([]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      setCartItems(response.data);
    } catch (error) {
      console.error('Erro ao buscar itens do carrinho', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCartItems();

    // Set up polling every 5 seconds
    const intervalId = setInterval(fetchCartItems, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [userId]);

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity > 0) {
      try {
        await axios.put(`http://localhost:5000/api/cart/${cartItemId}`, { quantity: newQuantity });
        fetchCartItems();
      } catch (error) {
        console.error('Erro ao atualizar quantidade', error);
      }
    } else {
      removeFromCart(cartItemId);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${cartItemId}`);
      fetchCartItems();
    } catch (error) {
      console.error('Erro ao remover item do carrinho', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="cart-container">
      <h3>Carrinho de Compras</h3>
      {cartItems.length === 0 ? (
        <p>Seu carrinho está vazio</p>
      ) : (
        <>
          <ul className='table'>
            {cartItems.map((item) => (
              <li key={item.id} className='listbtn'>
                {item.name} | R$ {item.price} | Quantidade: 
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                {item.quantity}
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                <button onClick={() => removeFromCart(item.id)}>Remover</button>
              </li>
            ))}
          </ul>
          <div>Total: R$ {calculateTotal()}</div>
          <button>Finalizar Compra</button>
        </>
      )}
    </div>
  );
}

export default Cart;