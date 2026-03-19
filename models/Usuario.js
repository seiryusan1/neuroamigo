// models/Usuario.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
    static async findByEmail(email) {
        const sql = 'SELECT * FROM usuarios WHERE email = ? AND activo = true';
        const results = await db.query(sql, [email]);
        return results[0] || null;
    }

    static async findById(id) {
        const sql = 'SELECT id, nombre, email, fecha_registro, preferencia_modo, googleId FROM usuarios WHERE id = ? AND activo = true';
        const results = await db.query(sql, [id]);
        return results[0] || null;
    }

    static async findByGoogleId(googleId) {
        const sql = 'SELECT * FROM usuarios WHERE googleId = ? AND activo = true';
        const results = await db.query(sql, [googleId]);
        return results[0] || null;
    }

    static async findByEmailOrGoogle(email, googleId) {
        const sql = 'SELECT * FROM usuarios WHERE (email = ? OR googleId = ?) AND activo = true';
        const results = await db.query(sql, [email, googleId]);
        return results[0] || null;
    }

    static async create(usuarioData) {
        const { nombre, email, password, preferencia_modo = 'claro', googleId = null } = usuarioData;
        
        console.log('📝 Creando usuario con datos:', { nombre, email, googleId });
        
        let hashedPassword = '';
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        } else if (googleId) {
            const randomPassword = Math.random().toString(36).slice(-12);
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(randomPassword, salt);
        }
        
        const sql = 'INSERT INTO usuarios (nombre, email, password, preferencia_modo, googleId) VALUES (?, ?, ?, ?, ?)';
        const result = await db.query(sql, [nombre, email, hashedPassword, preferencia_modo, googleId]);
        
        return result.insertId;
    }

    static async validatePassword(usuario, password) {
        return await bcrypt.compare(password, usuario.password);
    }

    static async updateLastAccess(id) {
        const sql = 'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?';
        await db.query(sql, [id]);
    }

    static async updateGoogleId(id, googleId) {
        const sql = 'UPDATE usuarios SET googleId = ? WHERE id = ?';
        await db.query(sql, [googleId, id]);
    }
}

module.exports = Usuario;