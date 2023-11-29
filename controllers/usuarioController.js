import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";

// async por que interactua con la base de datos y puede tardar algo en responder.
const registrar = async (req, res) => {

  // Evitar registros duplicados
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({
    email
  }) //.findOne() metodo de mongoose para encontrar un dato específico.

  if (existeUsuario) {
    const error = new Error('Usuario ya registrado');
    return res.status(400).json({ msg: error.message });
  }


  //estamos enviando la información por el body, por lo tanto req.body
  try {
    const usuario = new Usuario(req.body) // Creamos una nueva instancia de Usuario() que será un objeto.
    usuario.token = generarId(); // Creamos el token en usuario
    await usuario.save() // .save() es para almacenar el objeto en la base de datos.

    // ENVIAR EL EMAIL DE CONFIRMACIÓN
    //Enviamos al helper emailRegistro un objeto con las informaciones del usuario que obtenemos de "usuario"
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token
    });

    res.json({ msg: 'Usuario Creado Correctamente. Revisa tu Email para confirmar tu cuenta' })

  } catch (error) {
    console.log(error)
  }

};


const autenticar = async (req, res) => {

  const { email, password } = req.body

  // Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    const error = new Error('El Usuario no existe');
    return res.status(404).json({ msg: error.message });
  }

  // Comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error('Tu cuenta no ha sido confirmada');
    return res.status(403).json({ msg: error.message })
  }

  // Comprobar el password
  if (await usuario.comprobarPassword(password)) {
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    const error = new Error('Contraseña incorrecta');
    return res.status(403).json({ msg: error.message })
  }
};


const confirmar = async (req, res) => {
  const { token } = req.params; // ponemos en params por que el token está en la url.
  const usuarioConfirmar = await Usuario.findOne({ token });

  if (!usuarioConfirmar) {
    const error = new Error('Token no válido')
    return res.status(403).json({ msg: error.message })
  }

  try {
    usuarioConfirmar.confirmado = true; // confirmamos el usuario
    usuarioConfirmar.token = ''; // reiniciamos el token  (un solo uso)
    await usuarioConfirmar.save(); // almacenamos el usuario sin el token en la base de datos
    res.json({ msg: "Usuario Confirmado Correctamente" })
  } catch (error) {
    console.log(error)
  }
};


const olvidePassword = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    const error = new Error('El usuario no existe');
    return res.status(404).json({ msg: error.message })
  }

  try {
    usuario.token = generarId(); // Generamos un nuevo token para el usuario confirmar la cuenta.
    await usuario.save(); // Guardamos el usuario con el token en la base de datos.

    // ENVIAR EL EMAIL
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token
    })

    res.json({ msg: 'Hemos enviado un email con las instrucciones' })
  } catch (error) {
    console.log(error);
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params; // cuando quieras extraer algo de la URL hay que usar el metodo params.
  const tokenValido = await Usuario.findOne({ token }); // Buscamos si el token existe en algun usuario.

  if (tokenValido) {
    res.json({ msg: 'Token Valido y el Usuario existe' })
  } else {
    const error = new Error('Token no valido')
    res.status(404).json({ msg: error.message })
  }
};


const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const usuario = await Usuario.findOne({ token }); // Encontramos el usuario del Token

  // Comprobar que el token sea valido
  if (usuario) {
    usuario.password = password // Cambiamos el password del usuario por el nuevo password que estamos leyendo del body.
    usuario.token = ''; // Eliminamos el token usado.

    try {
      await usuario.save(); // Almacenamos el usuario con los nuevos datos en la base de datos.
      res.json({ msg: 'Password Modificado Correctamente' });
    } catch (error) {
      console.log(error)
    }

  } else {
    const error = new Error('Token no valido');
    res.status(404).json({ msg: error.message });
  }
};


const perfil = async (req, res) => {
  // Vamos a leer des del servidor.
  const { usuario } = req;

  res.json(usuario);
}

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil
}


// ---- EJEMPLO DE CONTROLLER ---

// const usuarios = (req, res) => {
//   res.json({ msg: "Desde API/USUARIOS" })
// }

// const crearUsuario = (req, res) => {
//   res.json({ msg: "Creando Usuario" })
// }

// export {
//   usuarios,
//   crearUsuario
// }