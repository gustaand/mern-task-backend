import express from 'express';
import {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  eliminarColaborador,
  buscarColaborador
  // obtenerTareas,
} from '../controllers/proyectoController.js';
// lo relacionado a proyectos, el usuario tiene que estar autenticado. Importamos checkAuth para verificar la autenticación
// Las rutas están con el checkAuth comprobando que están autenticados los usuarios. Hay que dar el permiso "Bearer TOKEN" en postman para enviar. 
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

// En caso de get nos trae los proyectos. En caso de post crea un nuevo proyecto.
router.route('/').get(checkAuth, obtenerProyectos).post(checkAuth, nuevoProyecto)

// Rutas con un proyecto singulare filtra por :id
router
  .route('/:id')
  .get(checkAuth, obtenerProyecto) // .get obtiene el proyecto.
  .put(checkAuth, editarProyecto) // .put actualiza/edita el proyecto.
  .delete(checkAuth, eliminarProyecto) // .delete elimina el proyecto entero.

// router.get('/tareas/:id', checkAuth, obtenerTareas);
router.post('/colaboradores', checkAuth, buscarColaborador)
router.post('/colaboradores/:id', checkAuth, agregarColaborador);
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador); // Para eliminar una parte de cierto recurso se usa post, no delete.

export default router;