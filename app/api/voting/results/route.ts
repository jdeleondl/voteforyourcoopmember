import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener total de asistentes
    const totalAttendees = await prisma.attendance.count()

    // Obtener todos los votos
    const votes = await prisma.vote.findMany({
      include: {
        candidate: true,
      },
    })

    // Contar votos únicos (miembros que votaron)
    const uniqueVoters = new Set(votes.map(v => v.memberId))
    const totalVotes = uniqueVoters.size

    // Validar que el número de votos coincida con asistentes
    const isValid = totalVotes === totalAttendees

    // Agrupar votos por candidato
    const candidateVotes: { [candidateId: string]: number } = {}
    votes.forEach(vote => {
      candidateVotes[vote.candidateId] = (candidateVotes[vote.candidateId] || 0) + 1
    })

    // Obtener todos los candidatos con sus votos
    const candidates = await prisma.candidate.findMany()

    const candidateResults = candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      position: candidate.position,
      council: candidate.council,
      voteCount: candidateVotes[candidate.id] || 0,
    }))

    // Agrupar resultados por consejo y posición
    const grouped: {
      [council: string]: {
        [position: string]: typeof candidateResults
      }
    } = {}

    candidateResults.forEach(result => {
      if (!grouped[result.council]) {
        grouped[result.council] = {}
      }

      const fullPosition = `${result.council}_${result.position}`
      if (!grouped[result.council][fullPosition]) {
        grouped[result.council][fullPosition] = []
      }

      grouped[result.council][fullPosition].push(result)
    })

    return NextResponse.json({
      totalVotes,
      totalAttendees,
      isValid,
      candidateResults: grouped,
    })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Error al obtener resultados' },
      { status: 500 }
    )
  }
}
