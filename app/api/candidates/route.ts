import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        status: 'active',
      },
      include: {
        member: true,
      },
      orderBy: [
        { council: 'asc' },
        { member: { name: 'asc' } },
      ],
    })

    // Agrupar candidatos por consejo
    const grouped: {
      [council: string]: any[]
    } = {}

    candidates.forEach((candidate) => {
      if (!grouped[candidate.council]) {
        grouped[candidate.council] = []
      }
      grouped[candidate.council].push({
        ...candidate,
        name: candidate.member.name,
      })
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
