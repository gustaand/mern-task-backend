import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import conectarDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

const app = express();
app.use(express.json());

// Para configurar los .env hay que instalar npm i dotenv y luego en index.js llamar dotenv.config()
dotenv.config();

conectarDB();

// --- Configurar CORS ---
const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {

    if (whitelist.includes(origin)) {
      // Si el origin está incluido en whitelist, puede consultar la API
      callback(null, true);
    } else {
      // No está permitido su request
      callback(new Error('Error de Cors'));
    }
  }
};

app.use(cors(corsOptions));

// --- Routing ---

// app.verbo('endpoint = ruta', (req = lo que envias, res = la respuesta que obtienes) => {} )
// importando rutas, ponemos app.verbo("ruta", importRuta)
app.use("/api/usuarios", usuarioRoutes); //el .use() soporta las 4 peticiones
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

// Crear una variable de entorno para el puerto para hacer el deployment, llamada PORT = process.env.PORT (se crea automaticamente)
const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


// SOCKET.IO
import { Server } from 'socket.io'

// Configurar Server
const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

// Abrir una conexión
io.on("connection", (socket) => {
  console.log('Conectado a socket.io');

  // Definir los eventos de socket io
  socket.on('abrir proyecto', (proyecto) => {
    // Crea la room con el parametro como "clave"
    socket.join(proyecto);
  });

  socket.on('nueva tarea', (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit('tarea agregada', tarea);
  })
    ;
  socket.on('eliminar tarea', (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit('tarea eliminada', tarea);
  });

  socket.on('actualizar tarea', (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit('tarea actualizada', tarea);
  });

  socket.on('cambiar estado', (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit('nuevo estado', tarea);
  });
});

// Dependencia de desarollo para actualizar los cambios automaticamente: npm i -D nodemon
// Para Habilitar los imports, agregar al package.json donde va la descripcion, version, etc: "type", "module",.
// Para configurar los .env hay que instalar npm i dotenv y luego en index.js llamar dotenv.config()
// Crear una variable de entorno para el puerto para hacer el deployment, llamada PORT = process.env.PORT (se crea automaticamente)



// socket.to("Emitir a quien entrar en la room").emit(lo que se va emitir)
// socket.to().emit('respuesta', { nombre: "Gustavo" })