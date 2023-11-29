import mongoose from 'mongoose';

const tareaSchema = mongoose.Schema({
  nombre: {
    type: String,
    trim: true,
    required: true
  },
  descripcion: {
    type: String,
    trim: true,
    required: true
  },
  estado: {
    type: Boolean,
    default: false,
  },
  fechaEntrega: {
    type: Date,
    require: true,
    default: Date.now()
  },
  prioridad: {
    type: String,
    require: true,
    enum: ['Baja', 'Media', 'Alta'], //enum: [] permite unicamente los valores que están dentro del array
  },
  proyecto: {
    type: mongoose.Schema.Types.ObjectId, // Mantiene una referencia.
    ref: 'Proyecto',  // Como esté definido en el schema es como lo va hacer referencia.
  },
  completado: {
    type: mongoose.Schema.Types.ObjectId, // Mantiene una referencia.
    ref: 'Usuario',  // Como esté definido en el schema es como lo va hacer referencia.
    default: null,
  },
}, {
  timestamps: true
});

const Tarea = mongoose.model("Tarea", tareaSchema); // Creamos el modelo con mongoose.model("NombreDelModelo", schemaDelModelo);

export default Tarea;