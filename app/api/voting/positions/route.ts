import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const council = searchParams.get('council')

    const where: any = {}

    if (council) {
      where.council = council
    }

    // Get all positions with their candidates
    const positions = await prisma.position.findMany({
      where,
      include: {
        candidates: {
          where: {
            status: 'active',
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: [
        { council: 'asc' },
        { order: 'asc' },
      ],
    })

    // Determine if each position is available for voting
    const now = new Date()
    const positionsWithAvailability = positions.map(position => {
      const isAvailable = !position.isOccupied ||
                         (position.termEndDate && position.termEndDate <= now)

      return {
        ...position,
        isAvailable,
        isBlocked: !isAvailable,
      }
    })

    // Group by council
    const councils = {
      administracion: positionsWithAvailability.filter(p => p.council === 'administracion'),
      vigilancia: positionsWithAvailability.filter(p => p.council === 'vigilancia'),
      credito: positionsWithAvailability.filter(p => p.council === 'credito'),
    }

    return NextResponse.json({ positions: positionsWithAvailability, councils })
  } catch (error) {
    console.error('Error fetching voting positions:', error)
    return NextResponse.json(
      { error: 'Error al obtener posiciones de votación' },
      { status: 500 }
    )
  }
}
