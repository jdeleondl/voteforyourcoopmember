import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Se requiere un código de votación' },
        { status: 400 }
      )
    }

    // Buscar el código en la tabla de asistencia
    const attendance = await prisma.attendance.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: {
        member: {
          include: {
            votes: true,
          },
        },
      },
    })

    if (!attendance) {
      return NextResponse.json(
        { error: 'Código inválido. Por favor verifica e intenta nuevamente.' },
        { status: 404 }
      )
    }

    // Verificar si ya votó
    const hasVoted = attendance.member.votes.length > 0

    return NextResponse.json({
      valid: true,
      hasVoted,
      member: {
        id: attendance.member.id,
        name: attendance.member.name,
      },
    })
  } catch (error) {
    console.error('Error validating code:', error)
    return NextResponse.json(
      { error: 'Error al validar el código' },
      { status: 500 }
    )
  }
}
