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

    // Obtener votos existentes con información del candidato
    const existingVotes = await prisma.vote.findMany({
      where: { memberId: attendance.memberId },
      include: {
        candidate: {
          include: { member: true }
        }
      }
    })

    // Obtener consejos que tienen candidatos activos
    const councilsWithCandidates = await prisma.candidate.groupBy({
      by: ['council'],
      where: { status: 'active' },
      _count: { id: true }
    })

    const availableCouncils = councilsWithCandidates
      .filter(c => c._count.id > 0)
      .map(c => c.council)

    // Mapear votos por consejo
    const votesByCouncil: Record<string, { candidateId: string, candidateName: string }> = {}
    existingVotes.forEach(vote => {
      votesByCouncil[vote.candidate.council] = {
        candidateId: vote.candidateId,
        candidateName: vote.candidate.member.name
      }
    })

    // Verificar si completó todos los consejos disponibles
    const votedCouncils = Object.keys(votesByCouncil)
    const hasCompletedAllVotes = availableCouncils.every(council => votedCouncils.includes(council))

    return NextResponse.json({
      memberId: attendance.memberId,
      memberName: attendance.member.name,
      votesCount: existingVotes.length,
      votesByCouncil,
      availableCouncils,
      hasCompletedAllVotes,
      // hasVoted es true solo si completó todos los votos disponibles
      hasVoted: hasCompletedAllVotes && availableCouncils.length > 0,
    })
  } catch (error) {
    console.error('Error verifying vote status:', error)
    return NextResponse.json(
      { error: 'Error al verificar estado de votación' },
      { status: 500 }
    )
  }
}
