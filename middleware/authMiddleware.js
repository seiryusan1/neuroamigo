// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: { code: 'NO_TOKEN', message: 'Token no proporcionado' }
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findById(decoded.id);
        
        if (!usuario) throw new Error();

        req.usuarioId = decoded.id;
        req.usuario = usuario;
        next();
    } catch (error) {
        res.status(401).json({
            error: { code: 'INVALID_TOKEN', message: 'Token inválido o expirado' }
        });
    }
};

module.exports = authMiddleware;