import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { sendConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId } = body

    if (!memberId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del miembro' },
        { status: 400 }
      )
    }

    // Verificar que el miembro existe
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { attendance: true },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Miembro no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya confirmó asistencia
    if (member.attendance) {
      return NextResponse.json(
        { error: 'Este miembro ya confirmó su asistencia', code: member.attendance.code },
        { status: 400 }
      )
    }

    // Generar código único de 8 caracteres
    const code = nanoid(8).toUpperCase()

    // Crear registro de asistencia
    const attendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        code: code,
      },
    })

    // Enviar correo de confirmación
    const emailResult = await sendConfirmationEmail({
      to: member.email,
      name: member.name,
      code: attendance.code,
    })

    // Actualizar registro si el email fue enviado
    if (emailResult.success) {
      await prisma.attendance.update({
        where: { id: attendance.id },
        data: { emailSent: true },
      })
    }

    return NextResponse.json({
      success: true,
      code: attendance.code,
      emailSent: emailResult.success,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
      },
    })
  } catch (error) {
    console.error('Error confirming attendance:', error)
    return NextResponse.json(
      { error: 'Error al confirmar asistencia' },
      { status: 500 }
    )
  }
}
