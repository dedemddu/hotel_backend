import { db } from '../config/database.js';

export const getHabitaciones = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT idhabitacion AS "idHabitacion", tipohabitacion AS "tipoHabitacion", numerohabitacion AS "numeroHabitacion", precio, disponibilidad FROM habitaciones ORDER BY idhabitacion ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor al consultar habitaciones.' });
  }
};

export const createHabitacion = async (req, res) => {
  try {
    const { tipoHabitacion, numeroHabitacion, precio } = req.body;
    if (!tipoHabitacion || !numeroHabitacion || !precio) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const result = await db.query(
      `INSERT INTO habitaciones (tipohabitacion, numerohabitacion, precio, disponibilidad) 
       VALUES ($1, $2, $3, TRUE) 
       RETURNING idhabitacion AS "idHabitacion", tipohabitacion AS "tipoHabitacion", numerohabitacion AS "numeroHabitacion", precio, disponibilidad`,
      [tipoHabitacion, numeroHabitacion, precio]
    );

    res.status(201).json({
      message: 'Habitación registrada con éxito',
      habitacion: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Violación de unicidad en número de habitación
      return res.status(400).json({ error: 'El número de habitación ya existe.' });
    }
    console.error('Error al registrar habitación:', error);
    res.status(500).json({ error: 'Error al registrar habitación.' });
  }
};
