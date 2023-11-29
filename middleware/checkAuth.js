// --- Proteger el endpoint, comprobar que el JWT sea válido, que el usuario sea correcto, etc. ----
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

// next: función de Express que nos permite ir al siguiente middleware (linea, funcion, comando, etc)
const checkAuth = async (req, res, next) => {

  let token;

  if (
    req.headers.authorization &&  // Si la petición está autorizada     y 
    req.headers.authorization.startsWith('Bearer') // Si la petición autorizada comienza con 'Bearer'
  ) {

    try {
      token = req.headers.authorization.split(' ')[1]; // .split(' ')[1] separamos la cadena en 2 y retornamos la posicion 1 (elimina el 'Bearer')

      //Decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // jwt.verify(token, La llave privada que se utilizó para crear el token)

      //Creamos una seccion con la información del usuario que podemos acceder en otras secciones.
      //.select("-password") para eliminar de la respuesta lo que pasamos dentro de (). console.log(req.usuario) para ver el objeto que retorna.
      req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updatedAt -__v");

      return next();
    } catch (error) {
      return res.status(404).json({ msg: 'Hubo un error' })
    }
  }

  if (!token) {
    const error = new Error('Token no válido');
    return res.status(401).json({ msg: error.message });
  }

  next();
};

export default checkAuth;

// En Postman puedes dar la autorización en authorization y el mas comun és Bearer Token