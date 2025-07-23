const { Router } = require('express');
const pool = require('../db');

const router = Router();

// POST /pedido – Crear un pedido
router.post('/', async (req, res) => {
  const { cliente, productos } = req.body;

  if (!cliente || !productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'Datos de pedido inválidos. Se requiere cliente y una lista de productos.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Iniciar transacción

    // 1. Calcular el total del pedido
    let total = 0;
    for (const item of productos) {
      const productoResult = await client.query('SELECT precio FROM productos WHERE id = $1', [item.producto_id]);
      if (productoResult.rows.length === 0) {
        throw new Error(`Producto con id ${item.producto_id} no encontrado.`);
      }
      const precioProducto = parseFloat(productoResult.rows[0].precio);
      total += precioProducto * item.cantidad;
    }

    // 2. Insertar el pedido en la tabla 'pedidos'
    const pedidoInsertResult = await client.query(
      'INSERT INTO pedidos (cliente, total) VALUES ($1, $2) RETURNING id',
      [cliente, total]
    );
    const pedidoId = pedidoInsertResult.rows[0].id;

    // 3. Insertar cada producto del pedido en la tabla 'pedido_productos'
    for (const item of productos) {
      await client.query(
        'INSERT INTO pedido_productos (pedido_id, producto_id, cantidad) VALUES ($1, $2, $3)',
        [pedidoId, item.producto_id, item.cantidad]
      );
    }

    await client.query('COMMIT'); // Confirmar transacción

    res.status(201).json({ message: 'Pedido creado exitosamente', pedidoId: pedidoId, total: total });
  } catch (error) {
    await client.query('ROLLBACK'); // Revertir transacción en caso de error
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ error: 'Error interno al procesar el pedido.', details: error.message });
  } finally {
    client.release(); // Liberar el cliente de vuelta al pool
  }
});

module.exports = router;

