// controllers/emocionController.js
const RegistroEmocional = require('../models/RegistroEmocional');

const emocionController = {
    async crearRegistro(req, res) {
        try {
            const { fecha, nivel_ansiedad, emocion_principal, notas } = req.body;
            const usuario_id = req.usuarioId;

            const registroId = await RegistroEmocional.create({
                usuario_id, fecha, nivel_ansiedad, emocion_principal, notas
            });

            res.status(201).json({
                message: 'Registro guardado',
                data: { id: registroId }
            });

        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: { code: 'DUPLICATE_ENTRY', message: 'Ya existe un registro para esta fecha' }
                });
            }
            console.error('Error:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    },

    async getRegistros(req, res) {
        try {
            const { fechaInicio, fechaFin, page = 1, limit = 20 } = req.query;
            const usuario_id = req.usuarioId;

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    error: { code: 'MISSING_PARAMETERS', message: 'Se requieren fechaInicio y fechaFin' }
                });
            }

            const result = await RegistroEmocional.getByDateRange(
                usuario_id, fechaInicio, fechaFin, parseInt(page), parseInt(limit)
            );

            res.json(result);

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    },

    async getUltimoRegistro(req, res) {
        try {
            const usuario_id = req.usuarioId;
            const registro = await RegistroEmocional.getLast(usuario_id);

            if (!registro) {
                return res.status(404).json({
                    error: { code: 'NO_RECORDS', message: 'No hay registros' }
                });
            }

            res.json({ data: registro });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    },

    async getEstadisticas(req, res) {
        try {
            const { año, mes } = req.params;
            const usuario_id = req.usuarioId;

            const estadisticas = await RegistroEmocional.getEstadisticasMensuales(usuario_id, año, mes);

            const total = estadisticas.length > 0 ? estadisticas[0].total_registros : 0;
            const promedio = estadisticas.length > 0 ? estadisticas[0].promedio_ansiedad : 0;
            const minimo = estadisticas.length > 0 ? estadisticas[0].minimo_ansiedad : 0;
            const maximo = estadisticas.length > 0 ? estadisticas[0].maximo_ansiedad : 0;

            const emociones = estadisticas.map(e => ({
                emocion: e.emocion_principal || 'sin especificar',
                frecuencia: e.frecuencia_emocion,
                porcentaje: total > 0 ? Math.round((e.frecuencia_emocion / total) * 100) : 0
            }));

            res.json({
                data: {
                    periodo: `${año}-${mes.toString().padStart(2, '0')}`,
                    total_registros: total,
                    estadisticas: {
                        promedio_ansiedad: parseFloat(promedio).toFixed(1),
                        minimo_ansiedad: parseInt(minimo),
                        maximo_ansiedad: parseInt(maximo)
                    },
                    emociones_frecuentes: emociones
                }
            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    },

    async getRegistroById(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.usuarioId;

            const registro = await RegistroEmocional.findById(id, usuario_id);

            if (!registro) {
                return res.status(404).json({
                    error: { code: 'NOT_FOUND', message: 'Registro no encontrado' }
                });
            }

            res.json({ data: registro });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    },

    async actualizarRegistro(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.usuarioId;

            const registro = await RegistroEmocional.findById(id, usuario_id);
            if (!registro) {
                return res.status(404).json({
                    error: { code: 'NOT_FOUND', message: 'Registro no encontrado' }
                });
            }

            await RegistroEmocional.update(id, usuario_id, req.body);
            res.json({ message: 'Registro actualizado' });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    },

    async eliminarRegistro(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.usuarioId;

            const registro = await RegistroEmocional.findById(id, usuario_id);
            if (!registro) {
                return res.status(404).json({
                    error: { code: 'NOT_FOUND', message: 'Registro no encontrado' }
                });
            }

            await RegistroEmocional.delete(id, usuario_id);
            res.json({ message: 'Registro eliminado' });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' }
            });
        }
    }
};

module.exports = emocionController;