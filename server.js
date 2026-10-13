import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientesRoutes from './src/routes/clientesRoutes.js';
import habitacionesRoutes from './src/routes/habitacionesRoutes.js';
import reservacionesRoutes from './src/routes/reservacionesRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Declaración de Endpoints RESTful
app.use('/api/clientes', clientesRoutes);
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/reservaciones', reservacionesRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[NODO 2 - UBUNTU API REST] Escuchando en http://0.0.0.0:${PORT}`);
});
