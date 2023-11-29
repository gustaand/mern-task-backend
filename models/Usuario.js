// --- Creación de MODELO ---
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = mongoose.Schema({
  nombre: {
    type: String,
    require: true,
    trim: true
  },
  password: {
    type: String,
    require: true,
    trim: true
  },
  email: {
    type: String,
    require: true,
    trim: true,
    unique: true, // garantizas que no haya dos cuentas con el mismo tipo de dato!
  },
  token: {
    type: String,
  },
  confirmado: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true, // Crea dos columnas más. Una de creado y otra de actualizado.
});


// Hasheamos los Passwords con los Middleware y Hooks. (mirar documentación de mongoose y de bcrypt)
usuarioSchema.pre("save", async function (next) {

  //revisar si el password no fue cambiado.
  if (!this.isModified('password')) {
    next(); //expresión de express para que si se cumple la condición, se va saltar la linea (return detendría toda la ejecución)
  }

  const salt = await bcrypt.genSalt(10); // genSalt genera una cadena de hasheo (10 es un buen numero)
  this.password = await bcrypt.hash(this.password, salt); //.hash(this.LaCadenaQueSeVaHashear, hasheo)
});


// Comprobar el Password usando .methods.nombreDelMetodo para crear un metodo nuevo
usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
  return await bcrypt.compare(passwordFormulario, this.password) // (dato que el usuario escribe, dato hasheado que ya existe) retorna true o false
}


//Para crear el modelo hay que usar mongoose.model("nombreDelModelo", Schema relacionado con el modelo)
const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;


// Definimos el Schema del usuario, lo que va haver en el campo del usuario en la base de datos.
// Existen muchos metodos en mongoose que se puede utilizar en los schemas, ej trim: true --> quita las barras de espacio al principio y al final

// VISITAR LA DOCUMENTACIÓN DE MONGOOSE PARA SABER MÁS SOBRE LOS SCHEMAS!

