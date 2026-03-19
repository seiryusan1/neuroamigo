// controllers/authController.js
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authController = {
    async register(req, res) {
        try {
            const { nombre, email, password, preferencia_modo } = req.body;

            const existingUser = await Usuario.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    error: { code: 'EMAIL_EXISTS', message: 'El email ya está registrado' }
                });
            }

            const userId = await Usuario.create({ nombre, email, password, preferencia_modo });
            const token = jwt.sign(
                { id: userId, email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );
            const usuario = await Usuario.findById(userId);

            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                data: { usuario, token }
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const usuario = await Usuario.findByEmail(email);
            if (!usuario) {
                return res.status(401).json({
                    error: { code: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos' }
                });
            }

            const isValidPassword = await Usuario.validatePassword(usuario, password);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: { code: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos' }
                });
            }

            await Usuario.updateLastAccess(usuario.id);

            const token = jwt.sign(
                { id: usuario.id, email: usuario.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            const usuarioData = {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                preferencia_modo: usuario.preferencia_modo
            };

            res.json({
                message: 'Login exitoso',
                data: { usuario: usuarioData, token }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    },

    async getProfile(req, res) {
        try {
            const usuario = await Usuario.findById(req.usuarioId);
            res.json({ data: usuario });
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    },

    async googleAuth(req, res) {
        try {
            const { token } = req.body;
            
            console.log('📱 Token recibido de Google:', token ? 'Sí' : 'No');
            
            if (!token) {
                return res.status(400).json({
                    error: { code: 'MISSING_TOKEN', message: 'Token no proporcionado' }
                });
            }

            const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
            const data = await response.json();
            
            if (data.error) {
                console.error('❌ Error de Google:', data.error);
                return res.status(401).json({
                    error: { code: 'INVALID_GOOGLE_TOKEN', message: 'Token de Google inválido' }
                });
            }

            const email = data.email;
            const googleId = data.sub;
            
            // 🔥 SOLUCIÓN: Asegurar que nombre nunca sea undefined
            let nombre = data.name || data.given_name || '';
            
            // Si el nombre está vacío, usar la parte del email antes del @
            if (!nombre || nombre.trim() === '') {
                nombre = email.split('@')[0]; // Ej: 2024310057
            }
            
            // Si aún así está vacío, poner un valor por defecto
            if (!nombre || nombre.trim() === '') {
                nombre = 'Usuario';
            }
            
            console.log('📧 Email:', email);
            console.log('📝 Nombre:', nombre);
            console.log('🆔 Google ID:', googleId);

            // Buscar usuario existente
            let usuario = await Usuario.findByEmailOrGoogle(email, googleId);
            
            if (!usuario) {
                console.log('📝 Creando nuevo usuario con Google');
                
                const userId = await Usuario.create({
                    nombre: nombre,        // ← AHORA SIEMPRE TIENE VALOR
                    email: email,
                    googleId: googleId,
                    preferencia_modo: 'claro'
                });
                
                usuario = await Usuario.findById(userId);
                console.log('✅ Nuevo usuario creado con ID:', userId);
            } else {
                console.log('✅ Usuario existente encontrado con ID:', usuario.id);
            }

            const jwtToken = jwt.sign(
                { id: usuario.id, email: usuario.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            await Usuario.updateLastAccess(usuario.id);

            res.json({
                message: 'Login con Google exitoso',
                data: {
                    usuario: {
                        id: usuario.id,
                        nombre: usuario.nombre,
                        email: usuario.email,
                        preferencia_modo: usuario.preferencia_modo
                    },
                    token: jwtToken
                }
            });

        } catch (error) {
            console.error('❌ Error en Google auth:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    },

    async logout(req, res) {
        try {
            res.json({ message: 'Sesión cerrada exitosamente' });
        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    }
};

module.exports = authController;