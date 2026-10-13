import { Router } from 'express';
import { getHabitaciones, createHabitacion } from '../controllers/habitacionesController.js';

const router = Router();
router.get('/', getHabitaciones);
router.post('/', createHabitacion);
export default router;
