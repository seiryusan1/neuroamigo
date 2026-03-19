// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const emocionRoutes = require('./routes/emocionRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3002', credentials: true }));
app.use(express.json());

// Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/emociones', emocionRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        message: 'API de NeuroAmigo',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            emociones: '/api/emociones',
            health: '/health'
        }
    });
});

// Health check
app.get('/health', async (req, res) => {
    const dbStatus = await db.testConnection();
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: dbStatus ? 'connected' : 'disconnected',
        port: PORT
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: `Ruta ${req.method} ${req.path} no encontrada`
        }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: {
            code: 'SERVER_ERROR',
            message: 'Error interno del servidor'
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    db.testConnection();
});