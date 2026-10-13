--CREACION DE LA BASE DE DATOS 
CREATE DATABASE hotel_db;
\c hotel_db;

-- Tabla Clientes
CREATE TABLE clientes (
    idCliente SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

-- Tabla Habitaciones
CREATE TABLE habitaciones (
    idHabitacion SERIAL PRIMARY KEY,
    tipoHabitacion VARCHAR(50) NOT NULL,
    numeroHabitacion VARCHAR(10) UNIQUE NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    disponibilidad BOOLEAN DEFAULT TRUE
);

-- Tabla Reservaciones
CREATE TABLE reservaciones (
    idReservacion SERIAL PRIMARY KEY,
    idCliente INT REFERENCES clientes(idCliente),
    idHabitacion INT REFERENCES habitaciones(idHabitacion),
    noches INT NOT NULL CHECK (noches > 0),
    precioTotal DECIMAL(10, 2) NOT NULL,
    fechaReserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales de prueba
INSERT INTO clientes (nombres, apellidos) VALUES 
('Juan', 'Pérez'),
('María', 'Gómez');

INSERT INTO habitaciones (tipoHabitacion, numeroHabitacion, precio, disponibilidad) VALUES 
('Simple', '101', 50.00, TRUE),
('Doble', '102', 85.00, TRUE),
('Suite Executiva', '201', 150.00, TRUE);
