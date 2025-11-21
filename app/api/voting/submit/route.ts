import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, candidateId, council } = body

    // Soporte para voto individual (nuevo) o múltiples votos (legado)
    const isIndividualVote = candidateId && council
    const votes = isIndividualVote ? [candidateId] : body.votes

    if (!code) {
      return NextResponse.json(
        { error: 'Código de votación es requerido' },
        { status: 400 }
      )
    }

    if (!votes || !Array.isArray(votes) || votes.length === 0) {
      return NextResponse.json(
        { error: 'Debe seleccionar al menos un candidato' },
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

    // Validar candidatos
    const candidateIds = votes.filter((id: string) => typeof id === 'string' && id.trim() !== '')

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

    // Obtener los consejos de los candidatos que se están votando
    const councilsToVote = [...new Set(candidates.map(c => c.council))]

    // Verificar que no haya votado antes en estos consejos específicos
    const existingVotesInCouncils = await prisma.vote.findMany({
      where: {
        memberId: attendance.memberId,
        candidate: {
          council: { in: councilsToVote }
        }
      },
      include: {
        candidate: true
      }
    })

    if (existingVotesInCouncils.length > 0) {
      const councilLabels: Record<string, string> = {
        administracion: 'Consejo de Administración',
        vigilancia: 'Consejo de Vigilancia',
        credito: 'Comité de Crédito',
      }
      const votedCouncils = [...new Set(existingVotesInCouncils.map(v => v.candidate.council))]
      return NextResponse.json(
        { error: `Ya has votado en: ${votedCouncils.map(c => councilLabels[c] || c).join(', ')}` },
        { status: 400 }
      )
    }

    // Verificar que no se vote dos veces por el mismo consejo en esta request
    const councilVotes: Record<string, number> = {}
    candidates.forEach((candidate) => {
      councilVotes[candidate.council] = (councilVotes[candidate.council] || 0) + 1
    })

    for (const [councilKey, count] of Object.entries(councilVotes)) {
      if (count > 1) {
        const councilLabels: Record<string, string> = {
          administracion: 'Consejo de Administración',
          vigilancia: 'Consejo de Vigilancia',
          credito: 'Comité de Crédito',
        }
        return NextResponse.json(
          { error: `No puedes votar por más de un candidato en ${councilLabels[councilKey] || councilKey}` },
          { status: 400 }
        )
      }
    }

    // Registrar votos
    const voteRecords = candidateIds.map((candId: string) => ({
      memberId: attendance.memberId,
      candidateId: candId,
    }))

    await prisma.vote.createMany({
      data: voteRecords,
    })

    // Verificar si completó todos los consejos disponibles
    const councilsWithCandidates = await prisma.candidate.groupBy({
      by: ['council'],
      where: { status: 'active' },
      _count: { id: true }
    })

    const availableCouncils = councilsWithCandidates
      .filter(c => c._count.id > 0)
      .map(c => c.council)

    const allVotes = await prisma.vote.findMany({
      where: { memberId: attendance.memberId },
      include: { candidate: true }
    })

    const votedCouncils = [...new Set(allVotes.map(v => v.candidate.council))]
    const hasCompletedAllVotes = availableCouncils.every(c => votedCouncils.includes(c))

    return NextResponse.json({
      success: true,
      message: 'Voto registrado exitosamente',
      votesCount: voteRecords.length,
      totalVotes: allVotes.length,
      hasCompletedAllVotes,
      votedCouncils,
    })
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Error al registrar el voto' },
      { status: 500 }
    )
  }
}
