import jwt from "jsonwebtoken";

const generarJWT = (id) => {
  //jwt.sign({objeto}, LLAVE_PRIVADA, {opciones}) 
  // .sign: Metodo que nos permite generar un json web token
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}

export default generarJWT;