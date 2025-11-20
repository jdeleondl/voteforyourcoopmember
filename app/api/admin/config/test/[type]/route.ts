import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import nodemailer from 'nodemailer'

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  return withAuth(request, async (session) => {
    try {
      const { type } = params

      if (type === 'database') {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`

        const memberCount = await prisma.member.count()

        return NextResponse.json({
          success: true,
          message: `Conexión exitosa a la base de datos.\n\nMiembros registrados: ${memberCount}`,
        })
      }

      if (type === 'email') {
        // Get email config
        const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com'
        const emailPort = parseInt(process.env.EMAIL_PORT || '587')
        const emailUser = process.env.EMAIL_USER
        const emailPassword = process.env.EMAIL_PASSWORD

        if (!emailUser || !emailPassword) {
          return NextResponse.json({
            success: false,
            error: 'Configuración de email incompleta.\n\nPor favor configure EMAIL_USER y EMAIL_PASSWORD en las variables de entorno.',
          })
        }

        // Test SMTP connection
        const transporter = nodemailer.createTransport({
          host: emailHost,
          port: emailPort,
          secure: false,
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        })

        await transporter.verify()

        return NextResponse.json({
          success: true,
          message: `Conexión exitosa al servidor SMTP.\n\nServidor: ${emailHost}:${emailPort}\nUsuario: ${emailUser}`,
        })
      }

      return NextResponse.json(
        { error: 'Tipo de prueba no válido' },
        { status: 400 }
      )
    } catch (error: any) {
      console.error(`Error testing ${params.type}:`, error)

      return NextResponse.json({
        success: false,
        error: error.message || 'Error desconocido',
      })
    }
  })
}
