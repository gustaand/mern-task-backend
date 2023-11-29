import Proyecto from '../models/Proyecto.js';
import Tarea from '../models/Tarea.js';

// AGREGAR TAREA
const agregarTarea = async (req, res) => {
  const { proyecto } = req.body; // Extraemos el proyecto de req.body para verificar si el proyecto existe

  const existeProyecto = await Proyecto.findById(proyecto); // Verificamos si el proyecto existe buscando por su ID

  if (!existeProyecto) {
    const error = new Error('El Proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }

  // Comprobamos si la persona que creó la tarea es quién creó el proyecto
  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) { // Le pasamos todo a string para poder comprobar
    const error = new Error('No tienes los permisos para añadir tareas');
    return res.status(403).json({ msg: error.message });
  }

  try {
    // Usamos el modelo de Tareas y creamos una nueva con create de mongoose y la pasamos al req.body
    const tareaAlmacenada = await Tarea.create(req.body);

    // Almacenar el ID en el proyecto: incertamos en el campo de tareas en Proyecto el id con .push()
    existeProyecto.tareas.push(tareaAlmacenada._id);
    await existeProyecto.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }

  console.log(existeProyecto);
}

// OBTENER TAREA
const obtenerTarea = async (req, res) => {
  const { id } = req.params; // Obtener el ID de la tarea por la URL (params)

  const tarea = await Tarea.findById(id).populate("proyecto"); // .populate() trae la información de lo que se pasa dentro asociado.

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no permitida");
    return res.status(403).json({ msg: error.message });
  }

  res.json(tarea);
}

// ACTUALIZAR TAREA
const actualizarTarea = async (req, res) => {
  const { id } = req.params; // Obtener el ID de la tarea por la URL (params)

  const tarea = await Tarea.findById(id).populate("proyecto"); // .populate() trae la información de lo que se pasa dentro asociado.

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no permitida");
    return res.status(403).json({ msg: error.message });
  }

  // Actualizaciones: Si no hay nada, asigna el que ya hay --> req.body. || tarea.
  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

  try {
    const tareaAlmacenada = await tarea.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
}

// ELIMINR TAREA
const eliminarTarea = async (req, res) => {
  const { id } = req.params; // Obtener el ID de la tarea por la URL (params)

  const tarea = await Tarea.findById(id).populate("proyecto"); // .populate() trae la información de lo que se pasa dentro asociado.

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no permitida");
    return res.status(403).json({ msg: error.message });
  }

  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);
    // await tarea.deleteOne(); Eliminamos la tarea que hemos buscado por el id con Tarea.findByUd(id)

    // Promise.allSettled([]) toma un array de awaits para cumprirlos todos al mismo tiempo
    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);
    res.json({ msg: "Tarea Eliminada" });
  } catch (error) {
    console.log(error);
  }
}

const cambiarEstado = async (req, res) => {
  const { id } = req.params; // Obtener el ID de la tarea por la URL (params)

  // .populate() trae la información de lo que se pasa dentro asociado.
  const tarea = await Tarea.findById(id).populate("proyecto");


  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())
  ) {
    const error = new Error("Acción no permitida");
    return res.status(403).json({ msg: error.message });
  }

  // Al enviar la peticion, el estado de la tarea será lo contrário
  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id // el usuario que completó la tarea
  await tarea.save()

  // Despues almacenar el usuario que completó la tarea, traemos la tareaAlmacenada con la informacion del proyecto y de la persona que completó
  const tareaAlmacenada = await Tarea.findById(id).populate("proyecto").populate("completado");

  res.json(tareaAlmacenada);
}

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado
}