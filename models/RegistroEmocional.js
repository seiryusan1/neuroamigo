// models/RegistroEmocional.js
const db = require('../config/database');

class RegistroEmocional {
    static async create(registroData) {
        const { usuario_id, fecha, nivel_ansiedad, emocion_principal, notas } = registroData;
        
        const sql = 'INSERT INTO registros_emocionales (usuario_id, fecha, nivel_ansiedad, emocion_principal, notas) VALUES (?, ?, ?, ?, ?)';
        const result = await db.query(sql, [usuario_id, fecha, nivel_ansiedad, emocion_principal, notas]);
        
        return result.insertId;
    }

    static async getByDateRange(usuario_id, fechaInicio, fechaFin, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        const countSql = 'SELECT COUNT(*) as total FROM registros_emocionales WHERE usuario_id = ? AND fecha BETWEEN ? AND ?';
        const countResult = await db.query(countSql, [usuario_id, fechaInicio, fechaFin]);
        const total = countResult[0].total;
        
        const dataSql = 'SELECT * FROM registros_emocionales WHERE usuario_id = ? AND fecha BETWEEN ? AND ? ORDER BY fecha DESC LIMIT ? OFFSET ?';
        const data = await db.query(dataSql, [usuario_id, fechaInicio, fechaFin, limit, offset]);
        
        return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
    }

    static async getLast(usuario_id) {
        const sql = 'SELECT * FROM registros_emocionales WHERE usuario_id = ? ORDER BY fecha DESC LIMIT 1';
        const results = await db.query(sql, [usuario_id]);
        return results[0] || null;
    }

    static async getEstadisticasMensuales(usuario_id, año, mes) {
        const sql = `
            SELECT 
                AVG(nivel_ansiedad) as promedio_ansiedad,
                MIN(nivel_ansiedad) as minimo_ansiedad,
                MAX(nivel_ansiedad) as maximo_ansiedad,
                COUNT(*) as total_registros,
                emocion_principal,
                COUNT(emocion_principal) as frecuencia_emocion
            FROM registros_emocionales 
            WHERE usuario_id = ? AND YEAR(fecha) = ? AND MONTH(fecha) = ?
            GROUP BY emocion_principal
            ORDER BY frecuencia_emocion DESC
        `;
        return await db.query(sql, [usuario_id, año, mes]);
    }

    static async findById(id, usuario_id) {
        const sql = 'SELECT * FROM registros_emocionales WHERE id = ? AND usuario_id = ?';
        const results = await db.query(sql, [id, usuario_id]);
        return results[0] || null;
    }

    static async update(id, usuario_id, registroData) {
        const { nivel_ansiedad, emocion_principal, notas } = registroData;
        const sql = 'UPDATE registros_emocionales SET nivel_ansiedad = ?, emocion_principal = ?, notas = ? WHERE id = ? AND usuario_id = ?';
        await db.query(sql, [nivel_ansiedad, emocion_principal, notas, id, usuario_id]);
    }

    static async delete(id, usuario_id) {
        const sql = 'DELETE FROM registros_emocionales WHERE id = ? AND usuario_id = ?';
        await db.query(sql, [id, usuario_id]);
    }
}

module.exports = RegistroEmocional;