import { db } from '../config/database.js';

export const createReservacion = async (req, res) => {
  const client = await db.connect();
  try {
    const { idCliente, idHabitacion, noches } = req.body;

    if (!idCliente || !idHabitacion || !noches) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    await client.query('BEGIN');

    // 1. Obtener y verificar habitación
    const roomRes = await client.query(
      'SELECT * FROM habitaciones WHERE idhabitacion = $1 FOR UPDATE',
      [idHabitacion]
    );

    if (roomRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Habitación no encontrada.' });
    }

    const room = roomRes.rows[0];

    if (!room.disponibilidad) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'La habitación no está disponible.' });
    }

    // 2. Calcular total y registrar reserva
    const precioTotal = Number(room.precio) * Number(noches);
    const insertRes = await client.query(
      `INSERT INTO reservaciones (idcliente, idhabitacion, noches, preciototal) 
       VALUES ($1, $2, $3, $4) RETURNING idreservacion AS "idReservacion", preciototal AS "precioTotal"`,
      [idCliente, idHabitacion, noches, precioTotal]
    );

    // 3. Actualizar disponibilidad
    await client.query(
      'UPDATE habitaciones SET disponibilidad = FALSE WHERE idhabitacion = $1',
      [idHabitacion]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Reserva creada con éxito',
      reservacion: {
        idReservacion: insertRes.rows[0].idReservacion,
        idCliente,
        idHabitacion,
        noches,
        precioTotal: insertRes.rows[0].precioTotal
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de reserva:', error);
    res.status(500).json({ error: 'No se pudo completar la reserva.' });
  } finally {
    client.release();
  }
};

export const getReservaciones = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.idreservacion AS "idReservacion", 
              r.idcliente AS "idCliente", 
              c.nombres || ' ' || c.apellidos AS "nombreCliente",
              r.idhabitacion AS "idHabitacion", 
              h.numerohabitacion AS "numeroHabitacion",
              r.noches, 
              r.preciototal AS "precioTotal", 
              r.fechareserva AS "fechaReserva"
       FROM reservaciones r
       JOIN clientes c ON r.idcliente = c.idcliente
       JOIN habitaciones h ON r.idhabitacion = h.idhabitacion
       ORDER BY r.idreservacion DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al consultar reservaciones:', error);
    res.status(500).json({ error: 'Error interno al consultar reservaciones.' });
  }
};

export const deleteReservacion = async (req, res) => {
  const client = await db.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // 1. Obtener la reservación para conocer la habitación asociada
    const resReserva = await client.query(
      'SELECT idhabitacion FROM reservaciones WHERE idreservacion = $1 FOR UPDATE',
      [id]
    );

    if (resReserva.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'La reservación no existe.' });
    }

    const idHabitacion = resReserva.rows[0].idhabitacion;

    // 2. Eliminar la reservación (Verbo DELETE)
    await client.query('DELETE FROM reservaciones WHERE idreservacion = $1', [id]);

    // 3. Liberar la habitación (Actualizar disponibilidad a TRUE)
    await client.query(
      'UPDATE habitaciones SET disponibilidad = TRUE WHERE idhabitacion = $1',
      [idHabitacion]
    );

    await client.query('COMMIT');

    res.json({
      message: `Reservación #${id} anulada con éxito y habitación liberada.`,
      idReservacionAnulada: Number(id),
      idHabitacionLiberada: idHabitacion
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al anular reservación:', error);
    res.status(500).json({ error: 'No se pudo anular la reservación.' });
  } finally {
    client.release();
  }
};
