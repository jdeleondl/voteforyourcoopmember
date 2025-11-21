import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const COUNCIL_LABELS: Record<string, string> = {
  administracion: 'Consejo de Administración',
  vigilancia: 'Consejo de Vigilancia',
  credito: 'Comité de Crédito',
}

const COUNCIL_ORDER = ['administracion', 'credito', 'vigilancia']

export async function GET() {
  try {
    // Obtener total de asistentes
    const totalAttendees = await prisma.attendance.count({
      where: { status: 'active' }
    })

    // Obtener todos los candidatos con sus votos y miembros
    const candidates = await prisma.candidate.findMany({
      where: { status: 'active' },
      include: {
        member: true,
        _count: {
          select: { votes: true }
        }
      },
      orderBy: [
        { council: 'asc' },
        { displayOrder: 'asc' }
      ]
    })

    // Obtener todos los votos para contar votantes únicos por consejo
    const allVotes = await prisma.vote.findMany({
      include: {
        candidate: true
      }
    })

    // Contar votantes únicos totales
    const uniqueVoters = new Set(allVotes.map(v => v.memberId))
    const totalVoters = uniqueVoters.size

    // Agrupar resultados por consejo
    const resultsByCouncil: {
      council: string
      councilLabel: string
      candidates: Array<{
        candidateId: string
        candidateName: string
        displayOrder: number
        council: string
        voteCount: number
      }>
      totalVotes: number
    }[] = []

    // Procesar cada consejo en orden
    for (const council of COUNCIL_ORDER) {
      const councilCandidates = candidates.filter(c => c.council === council)

      if (councilCandidates.length === 0) continue

      // Contar votos totales para este consejo
      const councilVotes = allVotes.filter(v => v.candidate.council === council)
      const totalCouncilVotes = councilVotes.length

      resultsByCouncil.push({
        council,
        councilLabel: COUNCIL_LABELS[council] || council,
        candidates: councilCandidates.map(c => ({
          candidateId: c.id,
          candidateName: c.member.name,
          displayOrder: c.displayOrder,
          council: c.council,
          voteCount: c._count.votes
        })).sort((a, b) => b.voteCount - a.voteCount), // Sort by votes descending
        totalVotes: totalCouncilVotes
      })
    }

    return NextResponse.json({
      results: resultsByCouncil,
      summary: {
        totalAttendees,
        totalVoters,
        participationRate: totalAttendees > 0 ? (totalVoters / totalAttendees) * 100 : 0,
      }
    })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Error al obtener resultados' },
      { status: 500 }
    )
  }
}
