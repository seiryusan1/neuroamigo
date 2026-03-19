-- Crear base de datos
CREATE DATABASE IF NOT EXISTS neuroamigo_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE neuroamigo_db;

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    preferencia_modo ENUM('claro', 'oscuro') DEFAULT 'claro',
    googleId VARCHAR(255) NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    
    INDEX idx_email (email),
    INDEX idx_fecha_registro (fecha_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: registros_emocionales
-- =====================================================
CREATE TABLE IF NOT EXISTS registros_emocionales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    nivel_ansiedad INT NOT NULL,
    emocion_principal VARCHAR(50),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT chk_nivel_ansiedad CHECK (nivel_ansiedad BETWEEN 1 AND 10),
    CONSTRAINT unique_registro_diario UNIQUE (usuario_id, fecha),
    
    INDEX idx_usuario_fecha (usuario_id, fecha),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- USUARIOS DE PRUEBA
-- =====================================================
-- Contraseña para ambos: password123
INSERT INTO usuarios (nombre, email, password) VALUES
('María González', 'maria@email.com', '$2a$10$XQ7v8Y9z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5'),
('Juan Pérez', 'juan@email.com', '$2a$10$XQ7v8Y9z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5');

-- =====================================================
-- REGISTROS DE EJEMPLO
-- =====================================================
INSERT INTO registros_emocionales (usuario_id, fecha, nivel_ansiedad, emocion_principal, notas) VALUES
(1, CURDATE(), 4, 'tranquilidad', 'Hoy fue un buen día'),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 7, 'ansiedad', 'Día complicado'),
(2, CURDATE(), 8, 'ansiedad', 'Muy estresado'),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 5, 'estrés', 'Regular');