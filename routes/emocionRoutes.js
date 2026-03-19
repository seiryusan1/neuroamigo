// routes/emocionRoutes.js
const express = require('express');
const router = express.Router();
const emocionController = require('../controllers/emocionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', emocionController.crearRegistro);
router.get('/', emocionController.getRegistros);
router.get('/ultimo', emocionController.getUltimoRegistro);
router.get('/estadisticas/:año/:mes', emocionController.getEstadisticas);
router.get('/:id', emocionController.getRegistroById);
router.put('/:id', emocionController.actualizarRegistro);
router.delete('/:id', emocionController.eliminarRegistro);

module.exports = router;