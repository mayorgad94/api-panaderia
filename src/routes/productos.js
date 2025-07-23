const { Router } = require('express');
const pool = require('../db');

const router = Router();

// GET /productos – Lista de productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos.' });
  }
});

module.exports = router;

