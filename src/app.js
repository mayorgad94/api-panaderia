const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');

const app = express();

// Middlewares
app.use(cors()); // Habilita CORS para todas las rutas y orígenes
app.use(express.json()); // Para entender los cuerpos de las peticiones en formato JSON

// Rutas
app.use('/productos', productosRoutes);
app.use('/pedido', pedidosRoutes);

module.exports = app;
