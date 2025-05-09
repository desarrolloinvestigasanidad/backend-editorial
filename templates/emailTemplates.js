// templates/emailTemplates.js

// Pie de correo estándar (añádelo al final de cada html)
const commonFooter = `
  <div class="footer-small" style="font-size:12px;color:#999;margin-top:30px;line-height:1.4;">
    <p>Este mensaje y los archivos adjuntos son confidenciales. Está dirigido exclusivamente a su destinatario y puede contener información confidencial o legalmente protegida. Si usted no es el destinatario, por favor notifíquelo al remitente y elimine el mensaje. Queda prohibida su copia, uso o distribución sin autorización expresa.</p>
    <p>De conformidad con el Reglamento (UE) 2016/679 (GDPR) y la LOPDGDD, le informamos que sus datos serán tratados por INVESTIGA SANIDAD con la finalidad de gestionar nuestra relación profesional. Puede ejercer sus derechos de acceso, rectificación, cancelación y oposición enviando un correo a: contacto@investigasanidad.es.</p>
    <p>Por respeto al medio ambiente, piense antes de imprimir este correo.</p>
  </div>
`;

// Template base para emails (common head, styles y footer)
function buildEmail({ title, bodyContent }) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #f0f0f0; }
        .logo { max-width: 250px; height: auto; }
        .content { padding: 30px 20px; }
        h1 { color: #5b21b6; font-size: 24px; margin-bottom: 20px; }
        p { margin-bottom: 16px; color: #4b5563; }
        .button { display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #6d28d9, #5b21b6); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; text-align: center; box-shadow: 0 4px 6px rgba(109, 40, 217, 0.2); transition: all 0.3s ease; }
        .button:hover { background: linear-gradient(to right, #5b21b6, #4c1d95); box-shadow: 0 6px 8px rgba(109, 40, 217, 0.3); }
        .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .alert-title { color: #b45309; font-weight: 600; margin-bottom: 5px; }
        .alert-content { color: #92400e; font-size: 14px; }
        .features { display: flex; justify-content: space-around; flex-wrap: wrap; margin: 30px 0; }
        .feature { text-align: center; width: 30%; min-width: 150px; margin-bottom: 20px; }
        .feature-icon { width: 50px; height: 50px; margin: 0 auto 10px; background-color: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .feature-title { font-weight: 600; color: #5b21b6; margin-bottom: 5px; }
        .feature-desc { font-size: 14px; color: #6b7280; }
        @media only screen and (max-width: 600px) {
          .container { width: 100%; border-radius: 0; }
          .content { padding: 20px 15px; }
          .feature { width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/INVESTIGA%20SANIDAD%20SIN%20FONDO-BLQnlRYtFpCHZb4z2Xwzh7LiZbpq1R.png" alt="Investiga Sanidad" class="logo">
        </div>
        <div class="content">
          ${bodyContent}
        </div>
        ${commonFooter}
      </div>
    </body>
    </html>
  `;
}

function getValidationEmailTemplate(userName, url) {
  const bodyContent = `
    <h1>¡Bienvenido/a a Investiga Sanidad!</h1>
    <p>Estimado/a ${userName},</p>
    <p>Gracias por registrarte en Investiga Sanidad. Para completar el proceso de registro y activar tu cuenta, por favor haz clic en el siguiente botón:</p>
    <div style="text-align: center;"><a href="${url}" class="button">Validar mi cuenta</a></div>
    <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
    <p style="word-break: break-all; font-size: 14px; color: #6b7280;">${url}</p>
    <p>Si no has solicitado este registro, puedes ignorar este correo.</p>
    <p>¡Bienvenido/a a nuestra comunidad de investigación científica!</p>
  `;
  return {
    subject: "Validación de Cuenta - Investiga Sanidad",
    html: buildEmail({ title: "Validación de Cuenta - Investiga Sanidad", bodyContent })
  };
}

function getWelcomeEmailTemplate(userName, loginUrl) {
  const bodyContent = `
    <h1>¡Registro completado con éxito!</h1>
    <p>Estimado/a ${userName},</p>
    <p>¡Tu cuenta ha sido registrada correctamente en Investiga Sanidad! Ahora puedes acceder a nuestra plataforma para publicar tus trabajos científicos.</p>
    <div style="text-align: center;"><a href="${loginUrl}" class="button">Iniciar sesión</a></div>
    <div class="features">
      <div class="feature"><div class="feature-icon">📚</div><div class="feature-title">Publicaciones</div><div class="feature-desc">Publica capítulos o libros completos</div></div>
      <div class="feature"><div class="feature-icon">🔍</div><div class="feature-title">ISBN Oficial</div><div class="feature-desc">Todas nuestras publicaciones tienen ISBN</div></div>
      <div class="feature"><div class="feature-icon">🏆</div><div class="feature-title">Certificados</div><div class="feature-desc">Recibe certificados oficiales</div></div>
    </div>
    <p>Si tienes alguna duda o necesitas asistencia, no dudes en contactarnos.</p>
    <p>¡Gracias por formar parte de Investiga Sanidad!</p>
  `;
  return {
    subject: "Te has registrado correctamente en Investiga Sanidad",
    html: buildEmail({ title: "Bienvenido a Investiga Sanidad", bodyContent })
  };
}

function getPasswordResetEmailTemplate(userName, resetUrl) {
  const bodyContent = `
    <h1>Recuperación de contraseña</h1>
    <p>Estimado/a ${userName},</p>
    <p>Hemos recibido una solicitud para restablecer tu contraseña en Investiga Sanidad. Para proceder, haz clic en el siguiente botón:</p>
    <div style="text-align: center;"><a href="${resetUrl}" class="button">Restablecer contraseña</a></div>
    <div class="alert">
      <div class="alert-title">¡Importante!</div>
      <div class="alert-content">Este enlace expirará en 1 hora por motivos de seguridad. Si no has solicitado este cambio, por favor ignora este correo o contacta con nuestro equipo de soporte.</div>
    </div>
    <p>Si necesitas asistencia adicional, puedes ponerte en contacto con nosotros respondiendo a este correo.</p>
  `;
  return {
    subject: "Recuperación de contraseña - Investiga Sanidad",
    html: buildEmail({ title: "Recuperación de contraseña - Investiga Sanidad", bodyContent })
  };
}

function getEditionPaymentEmailTemplate(userName, editionId, editionUrl) {
  const bodyContent = `
    <h1>¡Pago recibido correctamente!</h1>
    <p>Estimado/a ${userName},</p>
    <p>Hemos recibido su abono correctamente para la <strong>Edición ${editionId}</strong>. Ahora puede enviar sus capítulos en la sección "Libros" de dicha edición haciendo clic en el siguiente enlace:</p>
    <div style="text-align:center;"><a href="${editionUrl}" class="button">Acceder a Edición ${editionId}</a></div>
    <p>Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.</p>
    <p>¡Gracias por confiar en Investiga Sanidad!</p>
  `;
  return {
    subject: "Pago recibido correctamente - Investiga Sanidad",
    html: buildEmail({ title: "Pago recibido - Investiga Sanidad", bodyContent })
  };
}

function getBookPaymentEmailTemplate(userName, bookTitle, bookUrl) {
  const bodyContent = `
    <h1>¡Pago recibido correctamente!</h1>
    <p>Estimado/a ${userName},</p>
    <p>Hemos recibido su abono correctamente para el libro completo <strong>"${bookTitle}"</strong>. Ahora puede coordinar su libro y enviar sus trabajos en la sección "Libros":</p>
    <div style="text-align:center;"><a href="${bookUrl}" class="button">Acceder a "${bookTitle}"</a></div>
    <p>Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.</p>
    <p>¡Gracias por confiar en Investiga Sanidad!</p>
  `;
  return {
    subject: "Pago recibido correctamente - Investiga Sanidad",
    html: buildEmail({ title: "Pago recibido - Investiga Sanidad", bodyContent })
  };
}

function getBookCreationEmailTemplate(authorName, bookTitle, sectionUrl) {
  const bodyContent = `
    <h1>¡Libro creado con éxito!</h1>
    <p>Estimado/a ${authorName},</p>
    <p>Se ha creado oficialmente tu libro completo <strong>"${bookTitle}"</strong> en Investiga Sanidad. Ahora puedes coordinar e invitar a tus coautores, así como enviar tus capítulos en:</p>
    <div style="text-align:center;"><a href="${sectionUrl}" class="button">Sección de "${bookTitle}"</a></div>
    <p>Recuerda que como autor principal eres responsable de gestionar el trabajo de los coautores.</p>
    <p>Si necesitas ayuda o tienes alguna consulta, estamos aquí para ayudarte.</p>
  `;
  return {
    subject: "Has creado tu libro en Investiga Sanidad",
    html: buildEmail({ title: "Libro creado - Investiga Sanidad", bodyContent })
  };
}

function getCoauthorInvitationEmailTemplate(coauthorName, bookTitle, sectionUrl) {
  const subject = "Has sido añadido como coautor en un libro completo - Investiga Sanidad";
  const html = `
    <h1>Has sido añadido como coautor</h1>
    <p>Estimado/a ${coauthorName},</p>
    <p>Nos complace informarte que has sido añadido como coautor en el libro titulado <strong>"${bookTitle}"</strong>. Ahora puedes acceder a la sección correspondiente de nuestra plataforma para colaborar y enviar tus capítulos:</p>
    <div style="text-align:center;">
      <a href="${sectionUrl}" class="button">Ir a "${bookTitle}"</a>
    </div>
    <p>Si tienes alguna pregunta o necesitas orientación, estamos aquí para ayudarte.</p>
  `;
  return buildEmail({ title: subject, bodyContent: html });
}

function getBookClosedEmailTemplate(recipientName, bookTitle) {
  const subject = "Se ha cerrado tu libro - Investiga Sanidad";
  const bodyContent = `
    <h1>Libro cerrado</h1>
    <p>Estimado/a ${recipientName},</p>
    <p>Te informamos que el libro titulado <strong>"${bookTitle}"</strong> ha sido cerrado y ya no se pueden realizar más modificaciones ni envíos de capítulos. Nuestro equipo comenzará con la revisión final del contenido.</p>
    <p>Te mantendremos informado/a sobre los siguientes pasos. Si tienes consultas, no dudes en contactarnos.</p>
  `;
  return {
    subject,
    html: buildEmail({ title: subject, bodyContent })
  };
}

function getBookPublishedEmailTemplate(recipientName, bookTitle, downloadUrl, certificatesUrl) {
  const subject = "Tu libro ha sido publicado - Investiga Sanidad";
  const bodyContent = `
    <h1>Libro publicado</h1>
    <p>Estimado/a ${recipientName},</p>
    <p>Nos complace informarte que el libro titulado <strong>"${bookTitle}"</strong> ha sido revisado y publicado. Puedes descargar el libro completo y tus certificados en los siguientes enlaces:</p>
    <ul>
      <li><a href="${downloadUrl}">Descarga del Libro</a></li>
      <li><a href="${certificatesUrl}">Certificados de Participación</a></li>
    </ul>
    <p>¡Enhorabuena y gracias por tu colaboración!</p>
  `;
  return {
    subject,
    html: buildEmail({ title: subject, bodyContent })
  };
}

function getChapterSubmissionEmailTemplate(authorName, chapterTitle, contextLabel) {
  const subject = "Capítulo recibido - Investiga Sanidad";
  const bodyContent = `
    <h1>Capítulo en revisión</h1>
    <p>Estimado/a ${authorName},</p>
    <p>Hemos recibido tu capítulo titulado <strong>"${chapterTitle}"</strong> ${contextLabel}. Está pendiente de revisión y te informaremos tan pronto tengamos resultados.</p>
    <p>Si realizas modificaciones mientras esté en revisión o tras un rechazo, lo revisaremos nuevamente.</p>
  `;
  return {
    subject,
    html: buildEmail({ title: subject, bodyContent })
  };
}

function getChapterAcceptedEmailTemplate(authorName, chapterTitle, contextLabel) {
  const subject = "Tu capítulo ha sido aceptado - Investiga Sanidad";
  const bodyContent = `
    <h1>Capítulo aceptado</h1>
    <p>Estimado/a ${authorName},</p>
    <p>Nos alegra informarte que tu capítulo titulado <strong>"${chapterTitle}"</strong> ha sido aceptado ${contextLabel}. ¡Gracias por tu excelente trabajo!</p>
  `;
  return {
    subject,
    html: buildEmail({ title: subject, bodyContent })
  };
}

function getChapterRejectedEmailTemplate(authorName, chapterTitle, reason, contextLabel) {
  const subject = "Tu capítulo ha sido rechazado - Investiga Sanidad";
  const bodyContent = `
    <h1>Capítulo rechazado</h1>
    <p>Estimado/a ${authorName},</p>
    <p>Lamentamos informarte que tu capítulo titulado <strong>"${chapterTitle}"</strong> ha sido rechazado ${contextLabel}. A continuación, el motivo en cursiva:</p>
    <p><em>${reason}</em></p>
    <p>Te animamos a corregirlo y volver a enviarlo cuando estés listo/a.</p>
  `;
  return {
    subject,
    html: buildEmail({ title: subject, bodyContent })
  };
}

function getEditionPublishedEmailTemplate(recipientName, editionName, certificatesUrl, bookUrl, chaptersUrl) {
  const subject = "Edición publicada - Investiga Sanidad";
  const bodyContent = `
    <h1>Edición publicada</h1>
    <p>Estimado/a ${recipientName},</p>
    <p>La edición <strong>${editionName}</strong> ha sido publicada con éxito. Ya puedes descargar tus certificados, capítulos y el libro completo:</p>
    <ul>
      <li><a href="${certificatesUrl}">Certificados de Participación</a></li>
      <li><a href="${bookUrl}">Libro Completo</a></li>
      <li><a href="${chaptersUrl}">Capítulos Individuales</a></li>
    </ul>
    <p>¡Enhorabuena y gracias por tu contribución!</p>
  `;
  return {
    subject,
    html: buildEmail({ title: subject, bodyContent })
  };
}

// Exportación de todas las plantillas
module.exports = {
  getValidationEmailTemplate,
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate,
  getEditionPaymentEmailTemplate,
  getBookPaymentEmailTemplate,
  getBookCreationEmailTemplate,
  getCoauthorInvitationEmailTemplate,
  getBookClosedEmailTemplate,
  getBookPublishedEmailTemplate,
  getChapterSubmissionEmailTemplate,
  getChapterAcceptedEmailTemplate,
  getChapterRejectedEmailTemplate,
  getEditionPublishedEmailTemplate
};
