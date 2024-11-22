import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductDetail from '../components/ProductDetail';
import '../components/Forms.css';

function ProductListJs() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    
    axios.get('http://localhost:5000/api/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));

    
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserId(decodedToken.id);
    }
  }, []);

  const addToCart = async (product) => {
    try {
      await axios.post('http://localhost:5000/api/cart', {
        product_id: product.id,
        quantity: 1,
        user_id: userId
      });
      
    } catch (error) {
      console.error('Erro ao adicionar item ao carrinho', error);
    }
  };

  return (
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <div style={{width: '60%'}}>
        {selectedProduct && (
          <ProductDetail 
            productId={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
        <h3>Lista de opções</h3>
        <ul className='table'>
          {products.map((product) => (
            <li key={product.id} className='listbtn'>
              {product.name} | R$ {product.price} | Quantidade: {product.quantity}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{width: '35%'}}>
        {userId && <Cart userId={userId} />}
      </div>
    </div>
  );
}

export default ProductListJs;