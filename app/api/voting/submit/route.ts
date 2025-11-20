import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, votes } = body // votes es un array: [candidateId1, candidateId2, ...]

    if (!code || !votes || !Array.isArray(votes)) {
      return NextResponse.json(
        { error: 'Código y votos son requeridos' },
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

    if (existingVotes.length > 0) {
      return NextResponse.json(
        { error: 'Ya has votado anteriormente' },
        { status: 400 }
      )
    }

    // Validar que al menos haya un voto
    if (votes.length === 0) {
      return NextResponse.json(
        { error: 'Debe seleccionar al menos un candidato' },
        { status: 400 }
      )
    }

    // Validar que todos los candidatos existan y estén activos
    const candidateIds = votes.filter((id) => typeof id === 'string' && id.trim() !== '')

    if (candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron candidatos válidos' },
        { status: 400 }
      )
    }

    const candidates = await prisma.candidate.findMany({
      where: {
        id: { in: candidateIds },
      },
      include: {
        member: true,
      },
    })

    if (candidates.length !== candidateIds.length) {
      return NextResponse.json(
        { error: 'Uno o más candidatos no son válidos' },
        { status: 400 }
      )
    }

    // Verificar que todos los candidatos estén activos
    const inactiveCandidates = candidates.filter((c) => c.status !== 'active')
    if (inactiveCandidates.length > 0) {
      return NextResponse.json(
        { error: `El candidato ${inactiveCandidates[0].member.name} no está activo` },
        { status: 400 }
      )
    }

    // Verificar que no se vote dos veces por el mismo consejo
    const councilVotes: Record<string, number> = {}
    candidates.forEach((candidate) => {
      councilVotes[candidate.council] = (councilVotes[candidate.council] || 0) + 1
    })

    for (const [council, count] of Object.entries(councilVotes)) {
      if (count > 1) {
        const councilLabels: Record<string, string> = {
          administracion: 'Consejo de Administración',
          vigilancia: 'Consejo de Vigilancia',
          credito: 'Comité de Crédito',
        }
        return NextResponse.json(
          { error: `No puedes votar por más de un candidato en ${councilLabels[council] || council}` },
          { status: 400 }
        )
      }
    }

    // Registrar votos
    const voteRecords = candidateIds.map((candidateId) => ({
      memberId: attendance.memberId,
      candidateId,
    }))

    // Crear todos los votos en una transacción
    await prisma.vote.createMany({
      data: voteRecords,
    })

    return NextResponse.json({
      success: true,
      message: 'Voto registrado exitosamente',
      votesCount: voteRecords.length,
    })
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Error al registrar el voto' },
      { status: 500 }
    )
  }
}
