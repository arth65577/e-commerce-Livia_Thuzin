const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite');


db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,
  isAdmin INTEGER
)`);


db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  quantity INTEGER NOT NULL,
  user_id INTEGER,
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);

app.post('/register', async (req, res) => {
  const { email, password, isAdmin } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    'INSERT INTO users (email, password, isAdmin) VALUES (?, ?, ?)',
    [email, hashedPassword, isAdmin ? 1 : 0],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Erro ao registrar usuário' });
      }
      res.status(201).json({ message: 'Usuário registrado com sucesso' });
    }
  );
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin === 1 },
      'seu_segredo_jwt',
      { expiresIn: '1h' }
    );

    res.json({ token });
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'seu_segredo_jwt', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get('/user', authenticateToken, (req, res) => {
  if (!req.user) return res.sendStatus(401);
  res.json({ message: 'Rota de usuário acessada com sucesso', user: req.user });
});

app.get('/admin', authenticateToken, (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.sendStatus(403);
  res.json({ message: 'Rota de administrador acessada com sucesso', user: req.user });
});

app.post('/api/products', (req, res) => {
  const { name, description, price, quantity } = req.body;
  db.run(
    'INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)',
    [name, description, price, quantity],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao adicionar o produto' });
      }
      res.status(201).json({ id: this.lastID, name, description, price, quantity });
    }
  );
});

app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao listar os produtos' });
    }
    res.json(products);
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao obter o produto' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(product);
  });
});

app.put('/api/products/:id', (req, res) => {
  const { name, description, price, quantity } = req.body;
  db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, quantity = ? WHERE id = ?',
    [name, description, price, quantity, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar o produto' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      res.json({ id: req.params.id, name, description, price, quantity });
    }
  );
});

app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir o produto' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto excluído' });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.post('/api/cart', (req, res) => {
  const { product_id, quantity, user_id } = req.body;
  
  db.get('SELECT * FROM cart WHERE product_id = ? AND user_id = ?', 
    [product_id, user_id], 
    (err, existingCartItem) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar carrinho' });
      }

      if (existingCartItem) {
        
        db.run(
          'UPDATE cart SET quantity = quantity + ? WHERE product_id = ? AND user_id = ?',
          [quantity, product_id, user_id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Erro ao atualizar carrinho' });
            }
            res.json({ message: 'Quantidade atualizada no carrinho' });
          }
        );
      } else {
        
        db.run(
          'INSERT INTO cart (product_id, quantity, user_id) VALUES (?, ?, ?)',
          [product_id, quantity, user_id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Erro ao adicionar ao carrinho' });
            }
            res.status(201).json({ 
              id: this.lastID, 
              product_id, 
              quantity, 
              user_id 
            });
          }
        );
      }
  });
});

// Get cart items for a user
app.get('/api/cart/:user_id', (req, res) => {
  db.all(`
    SELECT c.id, c.quantity, p.name, p.price, p.id as product_id 
    FROM cart c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.user_id = ?
  `, [req.params.user_id], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar itens do carrinho' });
    }
    res.json(cartItems);
  });
});

// Update cart item quantity
app.put('/api/cart/:cart_item_id', (req, res) => {
  const { quantity } = req.body;
  
  db.run(
    'UPDATE cart SET quantity = ? WHERE id = ?',
    [quantity, req.params.cart_item_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar quantidade' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Item do carrinho não encontrado' });
      }
      res.json({ message: 'Quantidade atualizada com sucesso' });
    }
  );
});

// Remove item from cart
app.delete('/api/cart/:cart_item_id', (req, res) => {
  db.run(
    'DELETE FROM cart WHERE id = ?',
    [req.params.cart_item_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao remover item do carrinho' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Item do carrinho não encontrado' });
      }
      res.json({ message: 'Item removido do carrinho' });
    }
  );
});