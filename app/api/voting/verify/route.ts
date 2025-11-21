import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Código de votación es requerido' },
        { status: 400 }
      )
    }

    // Verificar código de votación
    const attendance = await prisma.attendance.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { member: true },
    })

    if (!attendance) {
      return NextResponse.json(
        { error: 'Código de votación inválido' },
        { status: 404 }
      )
    }

    if (attendance.status !== 'active') {
      return NextResponse.json(
        { error: 'Este código de votación no está activo' },
        { status: 400 }
      )
    }

    // Verificar si ya votó
    const existingVotes = await prisma.vote.findMany({
      where: { memberId: attendance.memberId },
    })

    const hasVoted = existingVotes.length > 0

    return NextResponse.json({
      hasVoted,
      memberName: attendance.member.name,
      votesCount: existingVotes.length,
    })
  } catch (error) {
    console.error('Error verifying vote status:', error)
    return NextResponse.json(
      { error: 'Error al verificar estado de votación' },
      { status: 500 }
    )
  }
}
