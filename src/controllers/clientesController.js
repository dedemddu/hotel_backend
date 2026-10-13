import { db } from '../config/database.js';

// Obtener todos los clientes (para el buscador/selector)
export const getClientes = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT idcliente AS "idCliente", nombres, apellidos, estado FROM clientes WHERE estado = TRUE ORDER BY idcliente DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al consultar clientes.' });
  }
};

// Registrar nuevo cliente
export const createCliente = async (req, res) => {
  try {
    const { nombres, apellidos } = req.body;
    if (!nombres || !apellidos) {
      return res.status(400).json({ error: 'Nombres y apellidos son requeridos.' });
    }

    const result = await db.query(
      'INSERT INTO clientes (nombres, apellidos) VALUES ($1, $2) RETURNING idcliente AS "idCliente", nombres, apellidos',
      [nombres, apellidos]
    );

    res.status(201).json({
      message: 'Cliente registrado con éxito',
      cliente: result.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(500).json({ error: 'Error al registrar cliente.' });
  }
};
