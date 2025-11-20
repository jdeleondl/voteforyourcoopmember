import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, votes } = body

    if (!code || !votes) {
      return NextResponse.json(
        { error: 'Se requiere código y votos' },
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
        { error: 'Código inválido' },
        { status: 404 }
      )
    }

    // Verificar si ya votó
    if (attendance.member.votes.length > 0) {
      return NextResponse.json(
        { error: 'Ya has ejercido tu derecho al voto' },
        { status: 400 }
      )
    }

    // Crear votos en transacción
    const voteRecords = Object.entries(votes).map(([position, candidateId]) => ({
      memberId: attendance.member.id,
      candidateId: candidateId as string,
      position,
    }))

    await prisma.vote.createMany({
      data: voteRecords,
    })

    return NextResponse.json({
      success: true,
      message: 'Votación registrada exitosamente',
    })
  } catch (error) {
    console.error('Error submitting votes:', error)
    return NextResponse.json(
      { error: 'Error al registrar votación' },
      { status: 500 }
    )
  }
}
