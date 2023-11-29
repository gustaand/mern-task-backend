import mongoose from "mongoose";

const conectarDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const url = `${connection.connection.host}:${connection.connection.port}`;
    console.log(`MongoDB Conectado en: ${url}`);

  } catch (error) {
    console.log(`error: ${error.message}`);
    process.exit(1); // Forzará el cierre del programa
  }
}

export default conectarDB;

// para conectar con mongoose: mongoose.connect('string de conección', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//  })