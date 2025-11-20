import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        position: true,
      },
      orderBy: [
        { council: 'asc' },
      ],
    })

    // Agrupar candidatos por consejo y posición
    const grouped: {
      [council: string]: {
        [position: string]: any[]
      }
    } = {}

    candidates.forEach((candidate) => {
      if (!grouped[candidate.council]) {
        grouped[candidate.council] = {}
      }
      const positionName = candidate.position.name
      if (!grouped[candidate.council][positionName]) {
        grouped[candidate.council][positionName] = []
      }
      grouped[candidate.council][positionName].push(candidate)
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
