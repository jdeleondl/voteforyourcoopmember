import nodemailer from 'nodemailer'

// Crear transporter para enviar emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

interface SendConfirmationEmailParams {
  to: string
  name: string
  code: string
}

export async function sendConfirmationEmail({ to, name, code }: SendConfirmationEmailParams) {
  // Si no hay configuración de email, solo registrar en consola
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log(`[EMAIL] Would send confirmation code to ${to}: ${code}`)
    return { success: true, message: 'Email configuration not set, skipping email send' }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"COOPINTEC 2025" <noreply@coopintec.com>',
      to,
      subject: 'Tu Código de Votación - COOPINTEC 2025',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Asistencia - COOPINTEC 2025</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">COOPINTEC 2025</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Sistema de Votación</p>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">¡Asistencia Confirmada!</h2>

            <p>Estimado/a <strong>${name}</strong>,</p>

            <p>Tu asistencia a la Asamblea General de COOPINTEC 2025 ha sido confirmada exitosamente.</p>

            <div style="background: #fff; border: 3px solid #667eea; border-radius: 10px; padding: 20px; margin: 25px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Tu código de votación es:</p>
              <p style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px; margin: 0; font-family: 'Courier New', monospace;">
                ${code}
              </p>
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #856404; font-size: 16px;">⚠️ Instrucciones Importantes:</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                <li><strong>Guarda este código</strong> - Lo necesitarás para ejercer tu derecho al voto</li>
                <li>Este código es <strong>personal e intransferible</strong></li>
                <li>No compartas tu código con nadie</li>
                <li>Usa este código para acceder a la página de votación</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/votacion"
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Ir a Votar Ahora
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
              Este es un correo automático. Por favor no responder.<br>
              Asamblea General COOPINTEC 2025
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
COOPINTEC 2025 - Confirmación de Asistencia

Estimado/a ${name},

Tu asistencia a la Asamblea General de COOPINTEC 2025 ha sido confirmada exitosamente.

TU CÓDIGO DE VOTACIÓN: ${code}

INSTRUCCIONES IMPORTANTES:
- Guarda este código - Lo necesitarás para ejercer tu derecho al voto
- Este código es personal e intransferible
- No compartas tu código con nadie
- Usa este código para acceder a la página de votación

Visita ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/votacion para votar.

---
Este es un correo automático. Por favor no responder.
Asamblea General COOPINTEC 2025
      `,
    })

    console.log(`Email sent: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}
