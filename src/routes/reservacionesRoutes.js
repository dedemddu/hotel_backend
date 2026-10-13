import { Router } from 'express';
import { getReservaciones, createReservacion, deleteReservacion } from '../controllers/reservacionesController.js';

const router = Router();

router.get('/', getReservaciones);
router.post('/', createReservacion);
router.delete('/:id', deleteReservacion);

export default router;
