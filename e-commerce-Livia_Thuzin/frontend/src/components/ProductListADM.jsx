import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';
import './Forms.css';

function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  };

  const deleteProduct = (id) => {
    axios.delete(`http://localhost:5000/api/products/${id}`)
      .then(() => {
        setProducts(products.filter((product) => product.id !== id));
        if (selectedProduct === id) setSelectedProduct(null);
        if (editingProduct === id) setEditingProduct(null);
      })
      .catch((err) => console.error(err));
  };

  const saveProduct = (product) => {
    const request = editingProduct ? axios.put : axios.post;
    const url = editingProduct 
      ? `http://localhost:5000/api/products/${editingProduct}` 
      : 'http://localhost:5000/api/products';

    request(url, product)
      .then((res) => {
        if (editingProduct) {
          setProducts(products.map((p) => (p.id === editingProduct ? res.data : p)));
        } else {
          setProducts([...products, res.data]);
        }
        setEditingProduct(null);
        fetchProducts(); 
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h2>Gerenciamento de Produtos</h2>
      <ProductForm productId={editingProduct} onSubmit={saveProduct} />

      {selectedProduct && (
        <ProductDetail productId={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      <h3>Lista de Opções</h3>
      <ul className='table'>
        {products.map((product) => (
          <li key={product.id} className='listbtn'>
            {product.name} | R$ {product.price} | Quantidade: {product.quantity}
            <button onClick={() => setEditingProduct(product.id)}>Editar</button>
            <button onClick={() => deleteProduct(product.id)}>Deletar</button>
            <button onClick={() => setSelectedProduct(product.id)}>Mostrar detalhes</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminProductList;