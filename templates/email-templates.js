// Pie de correo estándar (añádelo al final de cada html)
const commonFooter = `
          <div class="footer-small" style="font-size:12px;color:#999;margin-top:30px;line-height:1.4;">
            <p>Este mensaje y los archivos adjuntos son confidenciales. Está dirigido exclusivamente a su destinatario y puede contener información confidencial o legalmente protegida. Si usted no es el destinatario, por favor notifíquelo al remitente y elimine el mensaje. Queda prohibida su copia, uso o distribución sin autorización expresa.</p>
            <p>De conformidad con el Reglamento (UE) 2016/679 (GDPR) y la LOPDGDD, le informamos que sus datos serán tratados por INVESTIGA SANIDAD con la finalidad de gestionar nuestra relación profesional. Puede ejercer sus derechos de acceso, rectificación, cancelación y oposición enviando un correo a: contacto@investigasanidad.es.</p>
            <p>Por respeto al medio ambiente, piense antes de imprimir este correo.</p>
          </div>
`;

export function getValidationEmailTemplate(userName, url) {
  return {
    subject: "Validación de Cuenta - Investiga Sanidad",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Validación de Cuenta - Investiga Sanidad</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .logo {
            max-width: 250px;
            height: auto;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          h1 {
            color: #5b21b6; /* purple-800 */
            font-size: 24px;
            margin-bottom: 20px;
          }
          
          p {
            margin-bottom: 16px;
            color: #4b5563; /* gray-600 */
          }
          
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(to right, #6d28d9, #5b21b6); /* purple-700 to purple-800 */
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 6px rgba(109, 40, 217, 0.2);
            transition: all 0.3s ease;
          }
          
          .button:hover {
            background: linear-gradient(to right, #5b21b6, #4c1d95); /* purple-800 to purple-900 */
            box-shadow: 0 6px 8px rgba(109, 40, 217, 0.3);
          }
          
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #f0f0f0;
            color: #6b7280; /* gray-500 */
            font-size: 14px;
          }
          
          .social-links {
            margin-top: 15px;
          }
          
          .social-link {
            display: inline-block;
            margin: 0 8px;
          }
          
          @media only screen and (max-width: 600px) {
            .container {
              width: 100%;
              border-radius: 0;
            }
            
            .content {
              padding: 20px 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/INVESTIGA%20SANIDAD%20SIN%20FONDO-BLQnlRYtFpCHZb4z2Xwzh7LiZbpq1R.png" alt="Investiga Sanidad" class="logo">
          </div>
          <div class="content">
            <h1>¡Bienvenido/a a Investiga Sanidad!</h1>
            <p>Estimado/a ${userName},</p>
            <p>Gracias por registrarte en Investiga Sanidad. Para completar el proceso de registro y activar tu cuenta, por favor haz clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
              <a href="${url}" class="button">Validar mi cuenta</a>
            </div>
            
            <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
            <p style="word-break: break-all; font-size: 14px; color: #6b7280;">${url}</p>
            
            <p>Si no has solicitado este registro, puedes ignorar este correo.</p>
            
            <p>¡Bienvenido/a a nuestra comunidad de investigación científica!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Investiga Sanidad. Todos los derechos reservados.</p>
            <div class="social-links">
              <a href="#" class="social-link">Facebook</a>
              <a href="#" class="social-link">Instagram</a>
              <a href="#" class="social-link">Twitter</a>
            </div>
          </div>
        </div>
      </body>
      </html>
      `
  };
}

export function getWelcomeEmailTemplate(userName, loginUrl) {
  return {
    subject: "Te has registrado correctamente en Investiga Sanidad",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a Investiga Sanidad</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .logo {
            max-width: 250px;
            height: auto;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          h1 {
            color: #5b21b6; /* purple-800 */
            font-size: 24px;
            margin-bottom: 20px;
          }
          
          p {
            margin-bottom: 16px;
            color: #4b5563; /* gray-600 */
          }
          
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(to right, #6d28d9, #5b21b6); /* purple-700 to purple-800 */
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 6px rgba(109, 40, 217, 0.2);
            transition: all 0.3s ease;
          }
          
          .button:hover {
            background: linear-gradient(to right, #5b21b6, #4c1d95); /* purple-800 to purple-900 */
            box-shadow: 0 6px 8px rgba(109, 40, 217, 0.3);
          }
          
          .features {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            margin: 30px 0;
          }
          
          .feature {
            text-align: center;
            width: 30%;
            min-width: 150px;
            margin-bottom: 20px;
          }
          
          .feature-icon {
            width: 50px;
            height: 50px;
            margin: 0 auto 10px;
            background-color: #f3f4f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .feature-title {
            font-weight: 600;
            color: #5b21b6;
            margin-bottom: 5px;
          }
          
          .feature-desc {
            font-size: 14px;
            color: #6b7280;
          }
          
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #f0f0f0;
            color: #6b7280; /* gray-500 */
            font-size: 14px;
          }
          
          .social-links {
            margin-top: 15px;
          }
          
          .social-link {
            display: inline-block;
            margin: 0 8px;
          }
          
          @media only screen and (max-width: 600px) {
            .container {
              width: 100%;
              border-radius: 0;
            }
            
            .content {
              padding: 20px 15px;
            }
            
            .feature {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/INVESTIGA%20SANIDAD%20SIN%20FONDO-BLQnlRYtFpCHZb4z2Xwzh7LiZbpq1R.png" alt="Investiga Sanidad" class="logo">
          </div>
          <div class="content">
            <h1>¡Registro completado con éxito!</h1>
            <p>Estimado/a ${userName},</p>
            <p>¡Tu cuenta ha sido registrada correctamente en Investiga Sanidad! Ahora puedes acceder a nuestra plataforma para publicar tus trabajos científicos.</p>
            
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Iniciar sesión</a>
            </div>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">📚</div>
                <div class="feature-title">Publicaciones</div>
                <div class="feature-desc">Publica capítulos o libros completos</div>
              </div>
              <div class="feature">
                <div class="feature-icon">🔍</div>
                <div class="feature-title">ISBN Oficial</div>
                <div class="feature-desc">Todas nuestras publicaciones tienen ISBN</div>
              </div>
              <div class="feature">
                <div class="feature-icon">🏆</div>
                <div class="feature-title">Certificados</div>
                <div class="feature-desc">Recibe certificados oficiales</div>
              </div>
            </div>
            
            <p>Si tienes alguna duda o necesitas asistencia, no dudes en contactarnos.</p>
            <p>¡Gracias por formar parte de Investiga Sanidad!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Investiga Sanidad. Todos los derechos reservados.</p>
            <div class="social-links">
              <a href="#" class="social-link">Facebook</a>
              <a href="#" class="social-link">Instagram</a>
              <a href="#" class="social-link">Twitter</a>
            </div>
          </div>
        </div>
      </body>
      </html>
      `
  };
}

export function getPasswordResetEmailTemplate(userName, resetUrl) {
  return {
    subject: "Recuperación de contraseña - Investiga Sanidad",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de contraseña - Investiga Sanidad</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .logo {
            max-width: 250px;
            height: auto;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          h1 {
            color: #5b21b6; /* purple-800 */
            font-size: 24px;
            margin-bottom: 20px;
          }
          
          p {
            margin-bottom: 16px;
            color: #4b5563; /* gray-600 */
          }
          
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(to right, #6d28d9, #5b21b6); /* purple-700 to purple-800 */
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 6px rgba(109, 40, 217, 0.2);
            transition: all 0.3s ease;
          }
          
          .button:hover {
            background: linear-gradient(to right, #5b21b6, #4c1d95); /* purple-800 to purple-900 */
            box-shadow: 0 6px 8px rgba(109, 40, 217, 0.3);
          }
          
          .alert {
            background-color: #fef3c7; /* yellow-100 */
            border-left: 4px solid #f59e0b; /* amber-500 */
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          
          .alert-title {
            color: #b45309; /* amber-700 */
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .alert-content {
            color: #92400e; /* amber-800 */
            font-size: 14px;
          }
          
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #f0f0f0;
            color: #6b7280; /* gray-500 */
            font-size: 14px;
          }
          
          .social-links {
            margin-top: 15px;
          }
          
          .social-link {
            display: inline-block;
            margin: 0 8px;
          }
          
          @media only screen and (max-width: 600px) {
            .container {
              width: 100%;
              border-radius: 0;
            }
            
            .content {
              padding: 20px 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/INVESTIGA%20SANIDAD%20SIN%20FONDO-BLQnlRYtFpCHZb4z2Xwzh7LiZbpq1R.png" alt="Investiga Sanidad" class="logo">
          </div>
          <div class="content">
            <h1>Recuperación de contraseña</h1>
            <p>Estimado/a ${userName},</p>
            <p>Hemos recibido una solicitud para restablecer tu contraseña en Investiga Sanidad. Para proceder, haz clic en el siguiente botón y crea una nueva contraseña:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer contraseña</a>
            </div>
            
            <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
            <p style="word-break: break-all; font-size: 14px; color: #6b7280;">${resetUrl}</p>
            
            <div class="alert">
              <div class="alert-title">¡Importante!</div>
              <div class="alert-content">
                Este enlace expirará en 1 hora por motivos de seguridad. Si no has solicitado este cambio, por favor ignora este correo o contacta con nuestro equipo de soporte.
              </div>
            </div>
            
            <p>Si necesitas asistencia adicional, puedes ponerte en contacto con nosotros respondiendo a este correo.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Investiga Sanidad. Todos los derechos reservados.</p>
            <div class="social-links">
              <a href="#" class="social-link">Facebook</a>
              <a href="#" class="social-link">Instagram</a>
              <a href="#" class="social-link">Twitter</a>
            </div>
          </div>
        </div>
      </body>
      </html>
      `
  };
}
// 1. Pago recibido edición de libros
export function getEditionPaymentEmailTemplate(userName, editionId, editionUrl) {
  return {
    subject: "Pago recibido correctamente - Investiga Sanidad",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago recibido - Investiga Sanidad</title>
        <style>
          /* (utiliza los mismos estilos de los templates anteriores) */
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/INVESTIGA%20SANIDAD%20SIN%20FONDO-BLQnlRYtFpCHZb4z2Xwzh7LiZbpq1R.png" alt="Investiga Sanidad" class="logo">
          </div>
          <div class="content">
            <h1>¡Pago recibido correctamente!</h1>
            <p>Estimado/a ${userName},</p>
            <p>Hemos recibido su abono correctamente para la <strong>Edición ${editionId}</strong>. Ahora puede enviar sus capítulos en la sección "Libros" de dicha edición haciendo clic en el siguiente enlace:</p>
            <p style="text-align:center;"><a href="${editionUrl}" class="button">Acceder a Edición ${editionId}</a></p>
            <p>Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.</p>
            <p>¡Gracias por confiar en Investiga Sanidad!</p>
          </div>
          ${commonFooter}
        </div>
      </body>
      </html>
    `
  };
}

// 2. Pago recibido libro completo
export function getBookPaymentEmailTemplate(userName, bookTitle, bookUrl) {
  return {
    subject: "Pago recibido correctamente - Investiga Sanidad",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago recibido - Investiga Sanidad</title>
        <style>
          /* (mismos estilos) */
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/INVESTIGA%20SANIDAD%20SIN%20FONDO-BLQnlRYtFpCHZb4z2Xwzh7LiZbpq1R.png" alt="Investiga Sanidad" class="logo">
          </div>
          <div class="content">
            <h1>¡Pago recibido correctamente!</h1>
            <p>Estimado/a ${userName},</p>
            <p>Hemos recibido su abono correctamente para el libro completo <strong>"${bookTitle}"</strong>. Ahora puede coordinar su libro y enviar sus trabajos en la sección "Libros":</p>
            <p style="text-align:center;"><a href="${bookUrl}" class="button">Acceder a "${bookTitle}"</a></p>
            <p>Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.</p>
            <p>¡Gracias por confiar en Investiga Sanidad!</p>
          </div>
          ${commonFooter}
        </div>
      </body>
      </html>
    `
  };
}

// 3. Creación de libro completo (autor principal)
export function getBookCreationEmailTemplate(authorName, bookTitle, sectionUrl) {
  return {
    subject: "Has creado tu libro en Investiga Sanidad",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Libro creado - Investiga Sanidad</title>
        <style>/* mismos estilos */</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/INVESTIGA%20SANIDAD%20SIN%20FONDO-BLQnlRYtFpCHZb4z2Xwzh7LiZbpq1R.png" alt="Investiga Sanidad" class="logo">
          </div>
          <div class="content">
            <h1>¡Libro creado con éxito!</h1>
            <p>Estimado/a ${authorName},</p>
            <p>Se ha creado oficialmente tu libro completo <strong>"${bookTitle}"</strong> en Investiga Sanidad. Ahora puedes comenzar a coordinar e invitar a tus coautores, así como enviar tus capítulos en:</p>
            <p style="text-align:center;"><a href="${sectionUrl}" class="button">Sección de "${bookTitle}"</a></p>
            <p>Recuerda que como autor principal eres responsable de gestionar el trabajo de los coautores.</p>
            <p>Si necesitas ayuda o tienes alguna consulta, estamos aquí para..."
          </div>
          ${commonFooter}
        </div>
      </body>
      </html>
    `
  };
}