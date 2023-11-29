// ver informaciónes utiles al final.
import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";


//  OBTENER PROYECTOS  
// Se tiene que listar unicamente los proyectos de la persona que ha iniciado sección.
const obtenerProyectos = async (req, res) => {
  /* .find() nos va traer todos los proyectos de la base de datos, .where("creador").equals(req.usuario) donde "creador" es igual a req.usuaio logado
    .select('-tareas') para que no traiga las tareas 
    Por default la opcion está como '$and', le cambiamos a '$or' para que pueda cumplir una condición u otra*/
  const proyectos = await Proyecto.find({
    '$or': [
      { 'colaboradores': { $in: req.usuario } },
      { 'creador': { $in: req.usuario } },
    ]
  }) //Despues de hecha la comprobación, ya no requerimos el .where y .equals
    // .where("creador")
    // .equals(req.usuario)
    .select('-tareas');

  res.json(proyectos);
};



//  NUEVO PROYECTO 
const nuevoProyecto = async (req, res) => {
  // Instanciamos el proyecto = new Proyecto(req.body) con la información del body.
  const proyecto = new Proyecto(req.body);
  // Agregamos el proyecto.creador = req.usuario._id usando la información del usuario que podemos acceder gracias a la autenticación.
  proyecto.creador = req.usuario._id;

  // Almacenamos el nuevo objeto:
  try {
    const proyectoAlmacenado = await proyecto.save(); // .save() almacena el objeto en la base de datos.
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};



//  OBTENER PROYECTO 
// No se puede ver los proyectos que el usuario no haya creado o que no sea colaborador. (poner condicional)
const obtenerProyecto = async (req, res) => {
  const { id } = req.params; // Cojemos el ID de la url con params

  /* Buscamos el proyecto por el id y traemos con .populate("CampoRelacionado") 
  El/los objeto/s del campo relacionado 
  También puedes pasar al .populate("CampoRelacionado", "Nombre de lo que quieres traer") para traer información específica de aquél campo*/
  // Aplicar un populate a un populate con .populate({path: 'campo', populate: {path: 'campo'}}) etc...
  const proyecto = await Proyecto.findById(id)
    .populate({ path: 'tareas', populate: { path: 'completado', select: "nombre" } })
    .populate("colaboradores", "nombre email");

  // Verificar si proyecto existe
  if (!proyecto) {
    const error = new Error("No Encontrado");
    return res.status(404).json({ msg: error.message });
  }

  // Verifica si el creador és el mismo que el usuario logado; 
  /* El creador del proyecto es un id, y el usuario logado tiene un id, comparar los 2 ids; 
  Convertir en string para que sean el mismo tipo de dato para validar, Adicionamos el && .some() VER .some() ABAJO DE TODO! */
  if (proyecto.creador.toString() !== req.usuario._id.toString() &&
    !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
    // Si es diferente retornar msg de error.
    const error = new Error("Acción No Válida");
    return res.status(401).json({ msg: error.message });
  }

  // --- Obtener las tareas del Proyecto ---
  // const tareas = await Tarea.find().where("proyecto").equals(proyecto._id);

  // Retornamos un objeto con el proyecto y las tareas del proyecto.
  res.json(proyecto); // tareas
};



//  EDITAR PROYECTO 
// Actualización, metodo put en postman
// Usamos las mismas medidas de seguridad de obtenerProyecto
const editarProyecto = async (req, res) => {
  const { id } = req.params; // Cojemos el ID del proyecto des de la url con params

  const proyecto = await Proyecto.findById(id); // Buscamos el proyecto por el id

  if (!proyecto) {
    const error = new Error('No Encontrado');
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción No Válida");
    return res.status(401).json({ msg: error.message });
  }

  // Si el usuario manda algo en req.body, asingalo. Si no, usa el que ya está en la base de datos
  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  try {
    const proyectoAlmacenado = await proyecto.save(); //Almacenamos en la base de datos
    return res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};


//  ELIMINAR PROYECTO 
// Eliminar, metodo delete en postman
// Usamos las mismas medidas de seguridad de obtenerProyecto
const eliminarProyecto = async (req, res) => {
  const { id } = req.params; // Identificar proyecto

  const proyecto = await Proyecto.findById(id); // Consultar la base de datos

  // Verificar que el proyecto exista
  if (!proyecto) {
    const error = new Error('No Encontrado');
    return res.status(404).json({ msg: error.message });
  }

  // Verificar que quien trata de eliminar es la persona que lo creó
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción No Válida");
    return res.status(401).json({ msg: error.message });
  }

  // Despues de las verificaciones, eliminamos el proyecto
  try {
    await proyecto.deleteOne(); //Metodo de Mongoose que nos permite eliminar un proyecto de la base de datos.
    res.json({ msg: 'Proyecto Eliminado' });
  } catch (error) {
    console.log(error);
  }

};

// BUSCAR COLABORADOR
const buscarColaborador = async (req, res) => {
  const { email } = req.body;
  // Buscamos el usuario con findOne({email}) para encontrar por un campo (en este caso el email) y select() para decir lo que no queremos traer
  const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v');

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  res.json(usuario);
};

//  AGREGAR COLABORADOR 
const agregarColaborador = async (req, res) => {

  // Comprobar que el proyecto existe
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error('Proyecto No Encontrado');
    return res.status(404).json({ msg: error.message });
  }

  // Comprobar que la persona que va agregar el colaborador es el creador
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Acción No Válida');
    return res.status(401).json({ msg: error.message });
  }

  // Buscar el usuario
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v');

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  // El colaborador no es el admin del proyecto
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error('El Creador del Proyecto no puede ser colaborador');
    return res.status(404).json({ msg: error.message });
  }

  // Revisar que no esté ya agregado al proyecto
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error('El Usuario ya pertenece al Proyecto');
    return res.status(404).json({ msg: error.message });
  }

  // Si todo está bien, se puede agregar
  proyecto.colaboradores.push(usuario._id); // Pasar el id del colaborador al array de colaboradores con .push() 
  await proyecto.save()
  res.json({ msg: 'Usuario Agregado Correctamente' })
};


//  ELIMINAR COLABORADOR 
const eliminarColaborador = async (req, res) => {
  // Comprobar que el proyecto existe
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error('Proyecto No Encontrado');
    return res.status(404).json({ msg: error.message });
  }

  // Comprobar que la persona que va agregar el colaborador es el creador
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Acción No Válida');
    return res.status(401).json({ msg: error.message });
  }

  // Si todo está bien, se puede eliminar
  proyecto.colaboradores.pull(req.body.id); // Sacar el id del colaborador del array de colaboradores con .pull()
  await proyecto.save()
  res.json({ msg: 'Usuario Eliminado Correctamente' })
};


//  OBTENER TAREAS 
// const obtenerTareas = async (req, res) => {
//   const { id } = req.params;

//   const existeProyecto = await Proyecto.findById(id); // Comprobamos que el proyecto existe buscando por el id.

//   if (!existeProyecto) {
//     const error = new Error("Proyecto no encontrado");
//     return res.status(404).json({ msg: error.message });
//   }

//   // Obtener tareas: Creador o colaborador.

//   //.where().equals() metodo para comparar y traer el resultado que sea igual a lo que queremos.
//   const tareas = await Tarea.find().where('proyecto').equals(id); // Traer todas las tareas del proyecto que sea igual al id que estamos pasando.

//   res.json(tareas);
// };

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  eliminarColaborador,
  buscarColaborador,
  // obtenerTareas,
}


// Para empezar, ver en console.log(req.body); lo que se está enviando. Enviar en postman un json hacia la ruta en el body con el formato del modelo
// Hay la autenticación, entonces hay que dar el permiso "Bearer" en postman para enviar la petición. El token de usuario.
// Podemos ver las informaciones del usuario en console.log(req.usuario) ya que en las rutas hay el checkAuth autenticando el usuario antes.

/* 
  - - - some() - - -
some() ejecuta la función callback una vez por cada elemento presente en el array 
hasta que encuentre uno donde callback retorna un valor verdadero (true). 
Si se encuentra dicho elemento, some() retorna true inmediatamente. Si no, some() retorna false .
*/