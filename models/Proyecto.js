import mongoose from 'mongoose';

const proyectosSchema = mongoose.Schema({
  nombre: {
    type: String,
    trim: true,
    require: true,
  },
  descripcion: {
    type: String,
    trim: true,
    require: true,
  },
  fechaEntrega: {
    type: Date,
    default: Date.now(),
  },
  cliente: {
    type: String,
    trim: true,
    require: true,
  },
  // creador de tipo usuario. Hacer referencia con el ObjectId de los usuarios para relacionar al usuario que creó el proyecto
  creador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
  },
  tareas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tarea",
    }
  ],
  // Colaboradores será un array de usuarios
  colaboradores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  ],
}, {
  timestamps: true,
});

const Proyecto = mongoose.model("Proyecto", proyectosSchema);

export default Proyecto;