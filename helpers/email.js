import nodemailer from "nodemailer";

//  EMAIL DE REGISTRO
export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  // Prueba con mailtrap
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  // Información del email
  const info = await transport.sendMail({ // Usamos el metodo sendMail para enviar el email
    from: ' "UpTask - Administrador de Proyectos " <cuentas@uptask.com> ',    // from: de donde se envia
    to: email,    // A quién se envia
    subject: "UpTask - Comprueba tu cuenta",       // Asunto que va ser visible en email
    text: "Comprueba tu cuenta en UpTask",
    // html: Cuerpo del email, donde puede enviar email incluso con etiquetas html, estilos css, etc
    html: `
      <p> Hola ${nombre}, Comprueba tu cuenta en UpTask! </p>
      <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace: </p>

      <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>

      <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>

    `,
  })
}


// EMAIL DE OLVIDE PASSWORD
export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos;

  // Prueba con mailtrap
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  // Información del email
  const info = await transport.sendMail({ // Usamos el metodo sendMail para enviar el email
    from: ' "UpTask - Administrador de Proyectos " <cuentas@uptask.com> ',    // from: de donde se envia
    to: email,    // A quién se envia
    subject: "UpTask - Reestablece tu password",       // Asunto que va ser visible en email
    text: "Reestablece tu Password",
    // html: Cuerpo del email, donde puede enviar email incluso con etiquetas html, estilos css, etc
    html: `
      <p> Hola ${nombre}, has solicitado reestablecer tu password! </p>
      <p>Sigue el siguiente enlace para generar un nuevo password: </p>

      <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>

      <p>Si tu no solicitaste el cambio de password, puedes ignorar el mensaje</p>

    `,
  })
}