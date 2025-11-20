import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: [
        { council: 'asc' },
        { position: 'asc' },
      ],
    })

    // Agrupar candidatos por consejo y posición
    const grouped: {
      [council: string]: {
        [position: string]: typeof candidates
      }
    } = {}

    candidates.forEach((candidate) => {
      if (!grouped[candidate.council]) {
        grouped[candidate.council] = {}
      }
      if (!grouped[candidate.council][candidate.position]) {
        grouped[candidate.council][candidate.position] = []
      }
      grouped[candidate.council][candidate.position].push(candidate)
    })

    return NextResponse.json({ candidates: grouped })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json(
      { error: 'Error al obtener candidatos' },
      { status: 500 }
    )
  }
}
