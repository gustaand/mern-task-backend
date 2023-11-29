import express from "express";
import {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil
} from "../controllers/usuarioController.js";

import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

// ---- EJEMPLO ----

// app.verbo('endpoint = ruta', (req = lo que envias, res = la respuesta que obtienes) => {} )
// en este caso hemos definido la funcion (req, res) => {} en el Controller, por lo tanto:
// app.verbo("endpoint", funciónDelController);
// router.get('/', usuarios);
// router.post('/', crearUsuario);

// ---- Autenticación, Registro y Confrimación de Usuario ----
router.post('/', registrar);
router.post('/login', autenticar);
router.get('/confirmar/:token', confirmar); // los :token sirve para crear rutas dinamicas con express
router.post('/olvide-password', olvidePassword);
// router.get('/olvide-password/:token', comprobarToken);
// router.post('/olvide-password/:token', nuevoPassword);

// Opción de diferentes metodos hacia una misma ruta con Express.
// En el caso de .get ejecuta comprobarToken, en el caso de .post ejecuta nuevoPassword.
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword)


// ('endpoint', función 1, función 2) ejecuta en la orden
router.get("/perfil", checkAuth, perfil);

export default router;